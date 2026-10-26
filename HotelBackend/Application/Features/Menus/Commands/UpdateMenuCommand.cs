using Application.Dto.Menus;
using Application.Interfaces.Repositories.Menus;
using AutoMapper;
using Domain.Entities.Menus;
using MediatR;
using Shared;

namespace Application.Features.Menus.Commands;

public class UpdateMenuCommand : IRequest<Result<Menu>>
{
    public UpdateMenuCommand(Guid menuId, CreateMenuCommand updateMenuDto)
    {
        MenuId = menuId;
        UpdateMenuDto = updateMenuDto;
    }
    public Guid MenuId { get; set; }
    public CreateMenuCommand UpdateMenuDto { get; set; }
}
internal class UpdateMenuCommandHandler : IRequestHandler<UpdateMenuCommand, Result<Menu>>
{
    private readonly IMapper _mapper;
    private readonly IMenuRepository _menuRepository;
    public UpdateMenuCommandHandler(IMapper mapper, IMenuRepository menuRepository)
    {
        _mapper = mapper;
        _menuRepository = menuRepository;
    }
    public async Task<Result<Menu>> Handle(UpdateMenuCommand request, CancellationToken cancellationToken)
    {
        var data = await _menuRepository.Update(request.UpdateMenuDto.ImageURL, request.MenuId, request.UpdateMenuDto);

        if (data == null)
        {
            return Result<Menu>.BadRequest(" Not Updated.....");

        }

        return Result<Menu>.Success(data, "Updated.....");
    }
}
