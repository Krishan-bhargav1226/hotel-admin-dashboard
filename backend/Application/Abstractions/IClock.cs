namespace HotelAdmin.Application.Abstractions;

public interface IClock
{
    DateTimeOffset UtcNow { get; }
}
