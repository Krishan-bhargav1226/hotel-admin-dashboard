using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Persistence.Common.Services;

/// <summary>
/// Extracts user-friendly error messages from EF Core constraint violations at the persistence/context level.
/// Supports PostgreSQL (Npgsql) and falls back to generic parsing for other providers.
/// </summary>
public static class EfConstraintErrorExtractor
{
    /// <summary>
    /// Extracts a user-friendly message from a database update exception.
    /// Handles foreign key, unique constraint, not null, and other integrity violations.
    /// </summary>
    public static string? Extract(Exception exception)
    {
        if (exception is DbUpdateException dbEx)
            return ExtractFromDbUpdateException(dbEx);

        return null;
    }

    /// <summary>
    /// Extracts message from DbUpdateException. Returns the extracted message or the original message if parsing fails.
    /// </summary>
    public static string ExtractOrFallback(Exception exception)
    {
        return Extract(exception) ?? exception.InnerException?.Message ?? exception.Message;
    }

    private static string? ExtractFromDbUpdateException(DbUpdateException ex)
    {
        var inner = ex.InnerException;

        if (inner is PostgresException pgEx)
            return ExtractFromPostgresException(pgEx);

        if (inner?.GetType().Name == "SqlException")
            return ExtractFromSqlExceptionMessage(inner.Message);

        return ParseGenericConstraintMessage(inner?.Message ?? ex.Message);
    }

    private static string ExtractFromPostgresException(PostgresException pgEx)
    {
        return pgEx.SqlState switch
        {
            "23503" => FormatForeignKeyViolation(pgEx),
            "23505" => FormatUniqueViolation(pgEx),
            "23502" => FormatNotNullViolation(pgEx),
            "23514" => FormatCheckViolation(pgEx),
            "23511" => "A related record already exists.",
            "23P01" => "Exclusion constraint violation.",
            "25P02" => "Concurrent update conflict.",
            _ when pgEx.SqlState.StartsWith("23") => $"Data integrity error: {pgEx.MessageText}",
            _ => pgEx.MessageText
        };
    }

    private static string FormatForeignKeyViolation(PostgresException pgEx)
    {
        var tableName = GetTableName(pgEx);
        var columnName = GetColumnName(pgEx);

        if (!string.IsNullOrEmpty(tableName) && !string.IsNullOrEmpty(columnName))
        {
            var possessive = tableName.EndsWith('s') ? $"{tableName}'" : $"{tableName}'s";
            return $"{possessive} {columnName} does not exist.";
        }
        if (!string.IsNullOrEmpty(columnName))
            return $"{columnName} does not exist.";
        return "The referenced record does not exist.";
    }

    private static string FormatUniqueViolation(PostgresException pgEx)
    {
        var columnName = GetColumnName(pgEx);
        var detail = pgEx.Detail;
        var simplified = !string.IsNullOrEmpty(detail) ? SimplifyDetail(detail) : "";
        var baseMessage = string.IsNullOrEmpty(simplified)
            ? "A record with this value already exists."
            : $"Duplicate value. {simplified}";
        return string.IsNullOrEmpty(columnName)
            ? baseMessage
            : $"{columnName}: {baseMessage}";
    }

    /// <summary>
    /// Gets table name from PostgresException (TableName, or parsed from ConstraintName).
    /// </summary>
    private static string? GetTableName(PostgresException pgEx)
    {
        if (!string.IsNullOrEmpty(pgEx.TableName))
            return pgEx.TableName;

        var constraintName = pgEx.ConstraintName;
        if (string.IsNullOrEmpty(constraintName) || !constraintName.StartsWith("FK_", StringComparison.Ordinal)) return null;

        var parts = constraintName.Split('_');
        return parts.Length >= 2 ? parts[1] : null;
    }

    /// <summary>
    /// Gets column/field name from PostgresException (ColumnName, or parsed from ConstraintName).
    /// </summary>
    private static string? GetColumnName(PostgresException pgEx)
    {
        if (!string.IsNullOrEmpty(pgEx.ColumnName))
            return pgEx.ColumnName;

        var constraintName = pgEx.ConstraintName;
        if (string.IsNullOrEmpty(constraintName)) return null;

        // FK_Table_ReferencedTable_ColumnName or IX_Table_ColumnName - last segment is often the column
        var parts = constraintName.Split('_');
        return parts.Length >= 2 ? parts[^1] : null;
    }

    private static string FormatNotNullViolation(PostgresException pgEx)
    {
        var column = pgEx.ColumnName;
        return string.IsNullOrEmpty(column)
            ? "A required field was not provided."
            : $"The field '{column}' is required.";
    }

    private static string FormatCheckViolation(PostgresException pgEx)
    {
        return $"Validation failed: {pgEx.MessageText}";
    }

    private static string SimplifyDetail(string detail)
    {
        if (string.IsNullOrEmpty(detail)) return "";
        if (detail.Contains("redacted", StringComparison.OrdinalIgnoreCase))
            return "";
        if (detail.Contains("is not present"))
            return "The referenced record does not exist.";
        if (detail.Contains("already exists"))
            return "This value already exists.";
        return detail.Length > 150 ? detail[..147] + "..." : detail;
    }

    private static string? ExtractFromSqlExceptionMessage(string message)
    {
        if (message.Contains("FK_") && (message.Contains("REFERENCES") || message.Contains("foreign key")))
            return "The referenced record does not exist.";
        if (message.Contains("UNIQUE") || message.Contains("duplicate key"))
            return "A record with this value already exists.";
        return null;
    }

    private static string? ParseGenericConstraintMessage(string message)
    {
        if (string.IsNullOrEmpty(message)) return null;
        if (message.Contains("foreign key", StringComparison.OrdinalIgnoreCase) ||
            message.Contains("violates foreign key") || message.Contains("23503"))
            return "The referenced record does not exist.";
        if (message.Contains("unique", StringComparison.OrdinalIgnoreCase) ||
            message.Contains("duplicate") || message.Contains("23505"))
            return "A record with this value already exists.";
        if (message.Contains("not null", StringComparison.OrdinalIgnoreCase) || message.Contains("23502"))
            return "A required field was not provided.";
        return null;
    }
}
