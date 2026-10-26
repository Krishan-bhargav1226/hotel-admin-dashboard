using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Commons;

public static class ListQuery
{
    public static async Task<PaginatedResult<TDto>> ToPagedResultAsync<TEntity, TDto>(
        IQueryable<TEntity> query,
        int pageNumber,
        int pageSize,
        IMapper mapper,
        CancellationToken cancellationToken)
    {
        var count = await query.CountAsync(cancellationToken);
        List<TEntity> items;
        int page;
        int size;

        if (pageNumber == 0 && pageSize == 0)
        {
            items = await query.ToListAsync(cancellationToken);
            page = 1;
            size = count == 0 ? 1 : count;
        }
        else
        {
            page = pageNumber <= 0 ? 1 : pageNumber;
            size = pageSize <= 0 ? 10 : pageSize;
            items = await query.Skip((page - 1) * size).Take(size).ToListAsync(cancellationToken);
        }

        return PaginatedResult<TDto>.Create(mapper.Map<List<TDto>>(items), count, page, size, 200);
    }
}
