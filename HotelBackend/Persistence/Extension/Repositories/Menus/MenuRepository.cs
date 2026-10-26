using Application.Features.Menus.Commands;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.Menus;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Entities.Menus;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace Persistence.Extension.Repositories.Menus;

public class MenuRepository : IMenuRepository
{
    private readonly ApplicationDbContext _context;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private readonly ICreateDocumentPath _createDocumentPath;

    public MenuRepository(ApplicationDbContext context, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository, ICreateDocumentPath createDocumentPath)
    {
        _context = context;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Menu> Create(CreateMenuCommand dto)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return null;
        }

        var menu = new Menu
        {
            Name = dto.Name,
            URL = dto.URL,
            Icon = dto.Icon,
            SubTitle = dto.SubTitle,
            QueryString1 = dto.QueryString1,
            QueryString2 = dto.QueryString2,
            ParentId = dto.ParentId,
            MenuTypeId = dto.MenuTypeId,
            CreatedDate = DateTime.UtcNow,
            OrganizationId = userOrgInfo.OrganizationId.Value,
            ClaimValue = dto.ClaimValue
        };

        if (dto.ImageURL != null)
        {
            var imagePath = await _createDocumentPath.Create(dto.ImageURL);
            menu.ImageURL = imagePath;
        }

        await _context.Menus.AddAsync(menu);
        await _context.SaveChangesAsync();

        return menu;
    }

    public async Task<bool> Delete(Guid Id)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return false;
        }

        var menuExists = await _context.Menus
            .AnyAsync(x => x.IsDeleted == false && x.Id == Id && x.OrganizationId == userOrgInfo.OrganizationId.Value);

        if (!menuExists)
        {
            return false;
        }

        var menu = await _context.Menus.FindAsync(Id);
        if (menu != null)
        {
            menu.IsDeleted = true;
            menu.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return true;
    }

    public async Task<Menu> Update(IFormFile? from, Guid Id, CreateMenuCommand dto)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return null;
        }

        var menuExists = await _context.Menus
            .AnyAsync(x => !x.IsDeleted && x.Id == Id && x.OrganizationId == userOrgInfo.OrganizationId.Value);

        if (!menuExists)
        {
            return null;
        }

        var updateMenu = await _context.Menus
            .FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == Id && x.OrganizationId == userOrgInfo.OrganizationId.Value);

        if (from != null)
        {
            var imagePath = await _createDocumentPath.Create(from);
            updateMenu.ImageURL = imagePath;
        }

        updateMenu.MenuTypeId = dto.MenuTypeId;
        updateMenu.ParentId = dto.ParentId;
        updateMenu.Name = dto.Name;
        updateMenu.URL = dto.URL;
        updateMenu.Icon = dto.Icon;
        updateMenu.SubTitle = dto.SubTitle;
        updateMenu.QueryString1 = dto.QueryString1;
        updateMenu.QueryString2 = dto.QueryString2;
        updateMenu.UpdatedDate = DateTime.UtcNow;

        _context.Menus.Update(updateMenu);
        await _context.SaveChangesAsync();

        return updateMenu;
    }

    public async Task<List<Menu>> GetAll()
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return new List<Menu>();
        }

        var data = await _context.Menus
            .Include(x => x.MenuType)
            .Where(x => !x.IsDeleted && x.OrganizationId == userOrgInfo.OrganizationId.Value)
            .ToListAsync();

        return data;
    }

    public async Task<Menu> GetById(Guid Id)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return null;
        }

        var data = await _context.Menus
            .Include(x => x.MenuType)
            .FirstOrDefaultAsync(x => x.Id == Id && x.OrganizationId == userOrgInfo.OrganizationId.Value);

        return data;
    }

    public async Task<List<Menu>> ParentId(Guid Id)
    {
        return await _context.Menus.Where(x => x.ParentId == Id).Include(x => x.MenuType).ToListAsync();
    }

    public async Task<List<Menu>> TypeId(int Id)
    {
        return await _context.Menus.Where(x => x.MenuTypeId == Id).Include(x => x.MenuType).ToListAsync();
    }
}
