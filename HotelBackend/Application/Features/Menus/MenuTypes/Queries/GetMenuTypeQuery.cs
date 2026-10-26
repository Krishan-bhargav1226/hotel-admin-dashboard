using Application.Dto.MenuTypes;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.MenuTypes;
using MediatR;
using Shared;

namespace Application.Features.Menus.MenuTypes.Queries;

public class GetMenuTypeQuery : IRequest<Result<List<GetMenuTypeDto>>>
{
}
internal class GetMenuTypeQueryHandler : IRequestHandler<GetMenuTypeQuery, Result<List<GetMenuTypeDto>>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;
    public GetMenuTypeQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<List<GetMenuTypeDto>>> Handle(GetMenuTypeQuery request, CancellationToken cancellationToken)
    {
        var getMenuType = await _queryContext.Repository<MenuType>().GetAllAsync(cancellationToken);

        var mapMenuType = _mapper.Map<List<GetMenuTypeDto>>(getMenuType);

        return Result<List<GetMenuTypeDto>>.Success(mapMenuType, "MenuType list");
    }
}
