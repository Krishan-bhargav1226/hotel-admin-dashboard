using Application.Dto.Menus;
using Application.Interfaces.Repositories.Menus;
using AutoMapper;
using MediatR;
using Shared;

namespace Application.Features.Menus.Queries;

public class GetMenuQuery : IRequest<Result<List<GetMenuDto>>>
{
}
internal class GetMenuQueryHandler : IRequestHandler<GetMenuQuery, Result<List<GetMenuDto>>>
{
    private readonly IMapper _mapper;
    private readonly IMenuRepository _menuRepository;

    public GetMenuQueryHandler(IMenuRepository menuRepository, IMapper mapper)
    {
        _menuRepository = menuRepository;
        _mapper = mapper;
    }

    public async Task<Result<List<GetMenuDto>>> Handle(GetMenuQuery request, CancellationToken cancellationToken)
    {
        var data = await _menuRepository.GetAll();

        var mapData = _mapper.Map<List<GetMenuDto>>(data);

        return Result<List<GetMenuDto>>.Success(mapData, "Data is created.......");
    }
}
