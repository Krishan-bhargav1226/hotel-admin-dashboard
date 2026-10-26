namespace Shared;

/// <summary>
/// Thrown when a database constraint violation occurs (FK, unique, not null, etc.).
/// Carries a user-friendly message extracted from the underlying DbUpdateException.
/// </summary>
public class ConstraintViolationException : Exception
{
    public ConstraintViolationException(string message) : base(message) { }

    public ConstraintViolationException(string message, Exception innerException)
        : base(message, innerException) { }
}
