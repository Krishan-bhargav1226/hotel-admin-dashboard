using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Properties;
using Domain.Entities.Rooms;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Rooms.Commands;

internal static class RoomHotel
{
    public static async Task<int?> ResolveAsync(IUnitOfWork unitOfWork, int? callerPropertyId, int? requestedPropertyId, CancellationToken cancellationToken)
    {
        if (requestedPropertyId is > 0)
            return requestedPropertyId;
        if (callerPropertyId is > 0)
            return callerPropertyId;

        var hotels = await unitOfWork.Repository<HotelProperty>().Entities
            .Select(hotel => hotel.Id)
            .Take(2)
            .ToListAsync(cancellationToken);
        return hotels.Count == 1 ? hotels[0] : null;
    }

    public static async Task<List<Room>> ClaimUnassignedAsync(IUnitOfWork unitOfWork, int propertyId, CancellationToken cancellationToken)
    {
        var hotelCount = await unitOfWork.Repository<HotelProperty>().Entities.CountAsync(cancellationToken);
        if (hotelCount > 1)
            return [];

        var orphans = await unitOfWork.Repository<Room>().Entities
            .Where(room => room.PropertyId == null)
            .ToListAsync(cancellationToken);
        foreach (var room in orphans)
        {
            room.PropertyId = propertyId;
            await unitOfWork.Repository<Room>().UpdateAsync(room);
        }

        return orphans;
    }
}
