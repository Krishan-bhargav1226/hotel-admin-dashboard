using Application.Dto.Properties;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Rooms;
using Domain.Entities.Stays;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Queries;

internal static class PropertyLiveStats
{
    public static async Task ApplyAsync(IQueryContext query, IReadOnlyList<GetPropertyDto> properties, CancellationToken cancellationToken)
    {
        if (properties.Count == 0)
            return;

        var propertyIds = properties.Select(property => property.Id).ToList();
        var rooms = await query.Repository<Room>().Entities
            .Where(room => room.PropertyId != null && propertyIds.Contains(room.PropertyId.Value))
            .Select(room => new { room.Id, PropertyId = room.PropertyId!.Value, room.Status })
            .ToListAsync(cancellationToken);

        var roomIds = rooms.Select(room => room.Id).ToList();
        var today = DateTime.Now.Date;
        var tomorrow = today.AddDays(1);
        var stays = await query.Repository<Stay>().Entities
            .Where(stay => roomIds.Contains(stay.RoomId))
            .Select(stay => new { stay.RoomId, stay.TotalAmount, stay.CheckInAt, stay.CheckOutAt })
            .ToListAsync(cancellationToken);

        var roomProperty = rooms.ToDictionary(room => room.Id, room => room.PropertyId);
        foreach (var property in properties)
        {
            var propertyRooms = rooms.Where(room => room.PropertyId == property.Id).ToList();
            var propertyStays = stays.Where(stay => roomProperty.TryGetValue(stay.RoomId, out var owner) && owner == property.Id
                && ((stay.CheckOutAt >= today && stay.CheckOutAt < tomorrow)
                    || (stay.CheckOutAt == null && stay.CheckInAt >= today && stay.CheckInAt < tomorrow)))
                .ToList();

            property.RoomCount = propertyRooms.Count;
            property.OccupancyRate = propertyRooms.Count == 0
                ? 0
                : Math.Round(propertyRooms.Count(room => room.Status == RoomStatus.OCCUPIED) * 100m / propertyRooms.Count, 1);
            property.DailyRevenue = propertyStays.Sum(stay => stay.TotalAmount);
            property.Adr = propertyStays.Count == 0 ? 0 : Math.Round(property.DailyRevenue / propertyStays.Count, 2);
        }
    }
}
