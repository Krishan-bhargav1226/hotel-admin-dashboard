using Application.Dto.Menus;
using Application.Interfaces.Repositories.Menus;
using AutoMapper;
using MediatR;
using Shared;

namespace Application.Features.Menus.Queries;

public class GetMenuByParentIdQuery : IRequest<Result<List<GetMenuDto>>>
{
    public Guid ParentId { get; set; }

    public GetMenuByParentIdQuery(Guid parentId)
    {
        ParentId = parentId;
    }
}
internal class GetMenuByParentIdQueryHandler : IRequestHandler<GetMenuByParentIdQuery, Result<List<GetMenuDto>>>
{
    private readonly IMenuRepository _menuRepository;
    private readonly IMapper _mapper;

    public GetMenuByParentIdQueryHandler(IMenuRepository menuRepository, IMapper mapper)
    {
        _menuRepository = menuRepository;
        _mapper = mapper;
    }

    public async Task<Result<List<GetMenuDto>>> Handle(GetMenuByParentIdQuery request, CancellationToken cancellationToken)
    {
        var data = await _menuRepository.ParentId(request.ParentId);

        if (data == null || data.Count == 0)
        {
            return Result<List<GetMenuDto>>.NotFound("Parent not found");
        }

        var mapData = _mapper.Map<List<GetMenuDto>>(data);

        return Result<List<GetMenuDto>>.Success(mapData, "Menu data");

    }
}
