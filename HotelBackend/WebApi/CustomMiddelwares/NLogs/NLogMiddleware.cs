using NLog;
using System.Security.Claims;

namespace WebApi.CustomMiddleware.NLog;

public class NLogMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IHostEnvironment _environment;

    public NLogMiddleware(RequestDelegate next, IHttpContextAccessor httpContextAccessor, IHostEnvironment environment)
    {
        _next = next;
        _httpContextAccessor = httpContextAccessor;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var ipAddress = context.Connection.RemoteIpAddress?.ToString();
        var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue("Id");
        var method = context.Request.Method;
        var url = context.Request.Path;

        try
        {
            LogManager.GetCurrentClassLogger().Error("Request received: IP: {IpAddress}, UserId: {UserId}, Method: {Method}, URL: {Url}, Level:{level}",
                                                    ipAddress, userId, method, url, "Info");

            await _next(context);
        }
        catch (Exception ex)
        {
            LogManager.GetCurrentClassLogger().Error(ex, "Error occurred: IP: {IpAddress}, UserId: {UserId}, Method: {Method}, URL: {Url}, Level:{level}",
                                                                ipAddress, userId, method, url, "Error");

            if (_environment.IsProduction()// || _environment.IsDevelopment()
                )
            {
                var result = new
                {
                    Messages = new[] { ex.Message },
                    Succeeded = false,
                    Data = (object?)null,
                    Exception = (object?)null,
                    Code = 400,
                    Token = (object?)null
                };

                context.Response.StatusCode = 400;
                await context.Response.WriteAsJsonAsync(result);
            }
            else
            {
                throw;
            }
        }
    }
}
