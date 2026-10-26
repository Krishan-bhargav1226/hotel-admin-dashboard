using Application.Interfaces.Repositories.Locations;
using Domain.Entities.Locations;
using Domain.Entities.Locations.LocationTypes;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace Persistence.Extensions.Repositories.Locations;

public class LocationRepository : ILocationRepository
{
    private readonly ApplicationDbContext _context;

    public LocationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> CheckLocationId(int id)
    {
        return await _context.Locations.AnyAsync(x => x.Id == id);
    }

    public async Task<List<Location>> GetLocationsByType(LocationType locationType)
    {
        return await _context.Locations.Where(x => x.LocationType == locationType).ToListAsync();
    }

    public async Task<List<Location>> GetAllLocations(int? locationTypeId, int? parentId)
    {
        if (locationTypeId != null && locationTypeId != 0)
        {
            if (parentId != null && parentId != 0)
            {
                return await _context.Locations
                    .Where(x => (int)x.LocationType == locationTypeId && x.ParentId == parentId)
                    .Include(x => x.Parent)
                    .OrderBy(x=>x.Name)
                    .AsSplitQuery()
                    .ToListAsync();
            }

            return await _context.Locations
                .Where(x => (int)x.LocationType == locationTypeId)
                .Include(x => x.Parent)
                .OrderBy(x => x.Name)
                .AsSplitQuery()
                .ToListAsync();
        }

        if (parentId != null && parentId != 0)
        {
            return await _context.Locations
                .Where(x => x.ParentId == parentId)
                .Include(x => x.Parent)
                .OrderBy(x => x.Name)
                .AsSplitQuery()
                .ToListAsync();
        }

        return await _context.Locations
            .Include(x => x.Parent)
            .OrderBy(x => x.Name)
            .AsSplitQuery()
            .ToListAsync();
    }


    public async Task<Location?> GetLocationById(int id)
    {
        return await _context.Locations.Where(x => x.Id == id)
                            .Include(x => x.Parent).FirstOrDefaultAsync();
    }

    public async Task<int> CreateLocation(Location location)
    {
        await _context.Locations.AddAsync(location);
        await _context.SaveChangesAsync();

        return location.Id;
    }

    public async Task UpdateLocation(Location location)
    {
        _context.Locations.Update(location);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteLocation(Location location)
    {
        _context.Locations.Remove(location);
        await _context.SaveChangesAsync();
    }
}
