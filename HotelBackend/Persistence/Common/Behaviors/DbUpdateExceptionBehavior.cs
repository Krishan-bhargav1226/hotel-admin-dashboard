using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence.Common.Services;
using Shared;

namespace Persistence.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that catches EF constraint violations (DbUpdateException, ConstraintViolationException)
/// and converts them to Result&lt;T&gt;.BadRequest with user-friendly messages.
/// Lives in Persistence layer for proper context-level handling.
/// </summary>
public class DbUpdateExceptionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        try
        {
            return await next();
        }
        catch (ConstraintViolationException ex)
        {
            var result = CreateBadRequestResultOrDefault<TResponse>(CleanMessage(ex.Message));
            if (result != null) return result;
            throw;
        }
        catch (DbUpdateException ex)
        {
            var message = EfConstraintErrorExtractor.ExtractOrFallback(ex);
            var result = CreateBadRequestResultOrDefault<TResponse>(CleanMessage(message));
            if (result != null) return result;
            throw;
        }
    }

    private static string CleanMessage(string message)
    {
        if (message.Contains("Detail redacted", StringComparison.OrdinalIgnoreCase))
            return message.Split("Detail redacted", StringSplitOptions.None)[0].TrimEnd('.', ' ');
        return message;
    }

    private static TResponse? CreateBadRequestResultOrDefault<T>(string message)
    {
        if (!IsResultType(typeof(T), out var dataType))
            return default;

        var badRequest = CreateBadRequestResult(dataType, message);
        return badRequest != null ? (TResponse)badRequest : default;
    }

    private static bool IsResultType(Type responseType, out Type dataType)
    {
        dataType = null!;
        if (!responseType.IsGenericType) return false;

        var genericDef = responseType.GetGenericTypeDefinition();
        if (genericDef != typeof(Result<>)) return false;

        dataType = responseType.GetGenericArguments()[0];
        return true;
    }

    private static object? CreateBadRequestResult(Type dataType, string message)
    {
        var resultType = typeof(Result<>).MakeGenericType(dataType);
        var method = resultType.GetMethod("BadRequest", [typeof(string)]);
        return method?.Invoke(null, [message]);
    }
}
