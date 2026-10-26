using Domain.Entities.Locations;

namespace Application.Interfaces.Repositories.Locations;

public interface ILocationRepository
{
    Task<bool> CheckLocationId(int id);
    Task<List<Location>> GetAllLocations(int? locationTypeId,int? parentId);
    Task<Location?> GetLocationById(int id);
    Task<int> CreateLocation(Location location);
    Task UpdateLocation(Location location);
    Task DeleteLocation(Location location);
}
