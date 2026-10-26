using Application.Dto.Menus;
using Application.Interfaces.Repositories.Menus;
using AutoMapper;
using MediatR;
using Shared;

namespace Application.Features.Menus.Queries;

public class GetMenuByTypeIdQuery : IRequest<Result<List<GetMenuDto>>>
{
    public int TypeId { get; set; }

    public GetMenuByTypeIdQuery(int typeId)
    {
        TypeId = typeId;
    }
}
internal class GetMenuByTypeIdQueryHandler : IRequestHandler<GetMenuByTypeIdQuery, Result<List<GetMenuDto>>>
{
    private readonly IMenuRepository _menuRepository;
    private readonly IMapper _mapper;

    public GetMenuByTypeIdQueryHandler(IMenuRepository menuRepository, IMapper mapper)
    {
        _menuRepository = menuRepository;
        _mapper = mapper;
    }

    public async Task<Result<List<GetMenuDto>>> Handle(GetMenuByTypeIdQuery request, CancellationToken cancellationToken)
    {
        var data = await _menuRepository.TypeId(request.TypeId);

        if (data == null || data.Count == 0)
        {
            return Result<List<GetMenuDto>>.NotFound("Type not found");
        }

        var mapData = _mapper.Map<List<GetMenuDto>>(data);

        return Result<List<GetMenuDto>>.Success(mapData, "Menu data");
    }
}
