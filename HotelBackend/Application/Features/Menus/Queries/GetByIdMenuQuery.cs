using Application.Dto.Menus;
using Application.Interfaces.Repositories.Menus;
using AutoMapper;
using MediatR;
using Shared;

namespace Application.Features.Menus.Queries;

public class GetByIdMenuQuery : IRequest<Result<GetMenuDto>>
{
    public Guid Id { get; set; }
    public GetByIdMenuQuery(Guid id)
    {
        Id = id;
    }
    internal class GetByIdMenuQueryHandler : IRequestHandler<GetByIdMenuQuery, Result<GetMenuDto>>
    {
        private readonly IMenuRepository _menuRepository;
        private readonly IMapper _mapper;
        public GetByIdMenuQueryHandler(IMenuRepository menuRepository, IMapper mapper)
        {
            _menuRepository = menuRepository;
            _mapper = mapper;
        }

        public async Task<Result<GetMenuDto>> Handle(GetByIdMenuQuery request, CancellationToken cancellationToken)
        {
            var data = await _menuRepository.GetById(request.Id);

            if (data == null)
            {
                return Result<GetMenuDto>.BadRequest("Data not found");
            }

            var mapData = _mapper.Map<GetMenuDto>(data);

            return Result<GetMenuDto>.Success(mapData, "Data is created.....");
        }
    }
}
