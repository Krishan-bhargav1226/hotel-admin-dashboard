using Application.Features.Menus.Commands;
using Domain.Entities.Menus;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces.Repositories.Menus;

public interface IMenuRepository
{
    Task<Menu> Create(CreateMenuCommand dto);
    Task<bool> Delete(Guid Id);
    Task<Menu> Update(IFormFile from, Guid Id, CreateMenuCommand dto);
    Task<List<Menu>> GetAll();
    Task<Menu> GetById(Guid Id);
    Task<List<Menu>> ParentId(Guid Id);
    Task<List<Menu>> TypeId(int Id);
}
