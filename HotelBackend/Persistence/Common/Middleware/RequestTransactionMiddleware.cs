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
        if (HttpMethods.IsGet(context.Request.Method))
        {
            await _next(context);
            return;
        }

        var db = context.RequestServices.GetService<ApplicationDbContext>();
        if (db == null)
        {
            await _next(context);
            return;
        }

        await using var transaction = await db.Database.BeginTransactionAsync();

        try
        {
            await _next(context);
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
