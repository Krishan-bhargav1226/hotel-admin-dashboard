using HotelAdmin.Application.Abstractions;

namespace HotelAdmin.Infrastructure;

public sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
