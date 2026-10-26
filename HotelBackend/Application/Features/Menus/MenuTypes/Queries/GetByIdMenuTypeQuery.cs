using Application.Dto.MenuTypes;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.MenuTypes;
using MediatR;
using Shared;

namespace Application.Features.Menus.MenuTypes.Queries;

public class GetByIdMenuTypeQuery : IRequest<Result<GetMenuTypeDto>>
{
    public int Id { get; set; }

    public GetByIdMenuTypeQuery(int id)
    {
        Id = id;
    }
    internal class GetByIdMenuTypeQueryHandler : IRequestHandler<GetByIdMenuTypeQuery, Result<GetMenuTypeDto>>
    {
        private readonly IQueryContext _queryContext;
        private readonly IMapper _mapper;

        public GetByIdMenuTypeQueryHandler(IQueryContext queryContext, IMapper mapper)
        {
            _queryContext = queryContext;
            _mapper = mapper;
        }

        public async Task<Result<GetMenuTypeDto>> Handle(GetByIdMenuTypeQuery request, CancellationToken cancellationToken)
        {
            var menuType = await _queryContext.Repository<MenuType>().GetByIdAsync(request.Id, cancellationToken);

            if (menuType == null)
            {
                return Result<GetMenuTypeDto>.BadRequest("Id not found");
            }

            var mapMenuType = _mapper.Map<GetMenuTypeDto>(menuType);

            return Result<GetMenuTypeDto>.Success(mapMenuType, "MenuType list");
        }
    }
}
