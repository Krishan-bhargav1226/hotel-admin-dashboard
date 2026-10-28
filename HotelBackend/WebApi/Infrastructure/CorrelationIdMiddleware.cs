namespace WebApi.Infrastructure;

public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Correlation-ID";

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers.TryGetValue(HeaderName, out var supplied) && !string.IsNullOrWhiteSpace(supplied)
            ? supplied.ToString()
            : context.TraceIdentifier;

        context.TraceIdentifier = correlationId;
        context.Response.Headers[HeaderName] = correlationId;
        using (context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("Correlation").BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId
        }))
        {
            await next(context);
        }
    }
}
