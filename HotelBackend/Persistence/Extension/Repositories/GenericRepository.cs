using Application.Common.Exceptions;
using Application.Interfaces.GenericRepositories;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace Persistence.Extension.Repositories;

public class GenericRepository<T> : IGenericRepository<T> where T : BaseAuditableEntity
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _contextAccessor;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;

    public GenericRepository(ApplicationDbContext context, IHttpContextAccessor contextAccessor, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _context = context;
        _contextAccessor = contextAccessor;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
    }

    public IQueryable<T> Entities => _context.Set<T>();

    public async Task<T> AddAsync(T entity)
    {
        var userOrg = await _userIdAndOrganizationIdRepository.Get();
        var userId = userOrg.UserId;

        entity.CreatedDate = DateTime.UtcNow;
        entity.OrganizationId = userOrg.OrganizationId.Value;

        if (!string.IsNullOrEmpty(userOrg.UserId))
        {
            entity.CreatedBy = userId;
        }

        await _context.Set<T>().AddAsync(entity);

        return entity;
    }

    public async Task DeleteAsync(T entity)
    {
        var userOrg = await _userIdAndOrganizationIdRepository.Get();

        if (entity is BaseAuditableEntity auditableEntity)
        {
            auditableEntity.IsDeleted = true;
            auditableEntity.UpdatedDate = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(userOrg.UserId))
            {
                auditableEntity.UpdatedBy = userOrg.UserId;
            }

            _context.Entry(entity).State = EntityState.Modified;
        }
    }


    public async Task DeleteAsync(int id)
    {
        var userOrg = await _userIdAndOrganizationIdRepository.Get();

        T? entity = _context.Set<T>().Find(id);

        if (entity == null || entity.IsDeleted)
        {
            throw new BadRequestException($"{typeof(T).Name} Id {id} doesn't exists");
        }

        if (entity is BaseAuditableEntity auditableEntity)
        {
            auditableEntity.IsDeleted = true;
            auditableEntity.UpdatedDate = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(userOrg.UserId))
            {
                auditableEntity.UpdatedBy = userOrg.UserId;
            }

            _context.Entry(entity).State = EntityState.Modified;
        }

    }

    public async Task<List<T>> GetAll()
    {
        return await _context
              .Set<T>()
              .Where(e => !e.IsDeleted)
              .ToListAsync();
    }

    public async Task<T?> GetByID(int id)
    {
        return await _context
             .Set<T>()
             .Where(e => !e.IsDeleted && e.Id == id)
             .FirstOrDefaultAsync();
    }

    public async Task UpdateAsync(T entity, int id = 0)
    {
        var useOrga = await _userIdAndOrganizationIdRepository.Get();

        T? exist = _context.Set<T>().Find(id != 0 ? id : entity.Id);
        if (exist is null)
            return;

        entity.UpdatedDate = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(useOrga.UserId))
            entity.UpdatedBy = useOrga.UserId;

        _context.Entry(exist).CurrentValues.SetValues(entity);
    }
}
