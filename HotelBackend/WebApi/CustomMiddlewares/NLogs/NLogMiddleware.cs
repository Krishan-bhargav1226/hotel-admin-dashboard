using NLog;

namespace WebApi.CustomMiddleware.NLog;

public class NLogMiddleware
{
    private readonly RequestDelegate _next;

    public NLogMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var logger = LogManager.GetCurrentClassLogger();
        logger.Info("Request {Method} {Path} CorrelationId {CorrelationId}", context.Request.Method, context.Request.Path, context.TraceIdentifier);
        await _next(context);
        logger.Info("Response {StatusCode} {Method} {Path} CorrelationId {CorrelationId}", context.Response.StatusCode, context.Request.Method, context.Request.Path, context.TraceIdentifier);
    }
}
