using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Persistence.DataContext;

namespace Persistence.Common.Middleware;

public sealed class RequestTransactionMiddleware
{
    private readonly RequestDelegate _next;

    public RequestTransactionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
        if (HttpMethods.IsGet(context.Request.Method) || 
            HttpMethods.IsOptions(context.Request.Method) ||
            HttpMethods.IsHead(context.Request.Method) ||
            path.StartsWith("/api/chat") ||
            path.StartsWith("/api/fileupload") ||
            path.StartsWith("/swagger") ||
            path.StartsWith("/api-docs") ||
            path is "/api/user/login" or "/api/user/verify-otp" or "/api/user/forget-password" or "/api/user/reset-password" or "/api/user/resend-verification")
        {
            await _next(context);
            return;
        }

        var db = context.RequestServices.GetService<ApplicationDbContext>();
        if (db == null || db.Database.CurrentTransaction != null)
        {
            await _next(context);
            return;
        }

        await using var transaction = await db.Database.BeginTransactionAsync();

        try
        {
            await _next(context);
            if (context.Response.StatusCode >= 400)
            {
                await transaction.RollbackAsync();
            }
            else
            {
                await transaction.CommitAsync();
            }
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
