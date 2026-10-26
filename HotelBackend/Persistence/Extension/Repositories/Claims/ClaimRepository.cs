using Application.Features.Claims.Command;
using Application.Features.Roles.Command;
using Application.Interfaces.Repositories.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace Persistence.Extension.Repositories.Claims;

public class ClaimRepository : IClaimRepository
{
    private readonly ApplicationDbContext _context;

    public ClaimRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Create(CreateUpdateRoleClaimCommand command)
    {
        var currentRoleClaims = await _context.RoleClaims
            .Where(x => x.RoleId == command.RoleId.ToString())
            .ToListAsync();

        var roleClaimsToDelete = currentRoleClaims
            .Where(x => !command.MenuId.ToList().Contains(x.MenuId.ToString()))
            .ToList();

        if (roleClaimsToDelete.Count > 0)
        {
            _context.RoleClaims.RemoveRange(roleClaimsToDelete);
            await _context.SaveChangesAsync();
        }

        var roleClaimsToAdd = command.MenuId
            .Where(x => !currentRoleClaims.Select(x => x.MenuId.ToString()).Contains(x))
            .ToList();

        foreach (var menuId in roleClaimsToAdd.Distinct())
        {
            var menuGuid = Guid.Parse(menuId);
            var menu = await _context.Menus.FindAsync(menuGuid);

            var roleClaim = new Domain.Entities.Roles.RoleClaims.RoleClaim
            {
                MenuId = menuGuid,
                RoleId = command.RoleId.ToString(),
                ClaimType = "Permission",
                ClaimValue = menu?.ClaimValue ?? "",
            };

            await _context.RoleClaims.AddAsync(roleClaim);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<bool> Delete(int id)
    {
        var claimExists = await _context.UserClaims
            .AnyAsync(x => x.Id == id);

        if (!claimExists)
        {
            return false;
        }

        var claim = await _context.UserClaims.FindAsync(id);
        if (claim != null)
        {
            _context.UserClaims.Remove(claim);
            await _context.SaveChangesAsync();
        }

        return true;
    }

    public async Task<List<IdentityUserClaim<string>>> GetAll()
    {
        var getAllClaim = await _context.UserClaims.ToListAsync();
        return getAllClaim ?? new List<IdentityUserClaim<string>>();
    }

    public async Task<IdentityUserClaim<string>> GetById(int id)
    {
        var claim = await _context.UserClaims
            .FirstOrDefaultAsync(c => c.Id == id);

        return claim;
    }

    public async Task<bool> Update(int id, CreateClaimCommand command)
    {
        var claimExists = await _context.UserClaims
            .AnyAsync(x => x.Id == id);

        if (!claimExists)
        {
            return false;
        }

        var updateClaim = await _context.UserClaims.FindAsync(id);
        updateClaim.ClaimValue = command.ClaimValue;
        updateClaim.ClaimType = command.ClaimType;
        updateClaim.UserId = command.UserId.ToString();

        _context.UserClaims.Update(updateClaim);
        await _context.SaveChangesAsync();

        return true;
    }
}
