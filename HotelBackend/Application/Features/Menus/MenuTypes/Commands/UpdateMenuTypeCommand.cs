using Application.Dto.MenuTypes;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.MenuTypes;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Menus.MenuTypes.Commands;

public class UpdateMenuTypeCommand : IRequest<Result<GetMenuTypeDto>>
{
    public UpdateMenuTypeCommand(int id, CreateMenuTypeCommand createMenuTypeCommand)
    {
        Id = id;
        CreateMenuTypeCommand = createMenuTypeCommand;
    }
    public int Id { get; set; }
    public CreateMenuTypeCommand CreateMenuTypeCommand { get; set; }
}
internal class UpdateMenuTypeCommandHandler : IRequestHandler<UpdateMenuTypeCommand, Result<GetMenuTypeDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    public UpdateMenuTypeCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    public async Task<Result<GetMenuTypeDto>> Handle(UpdateMenuTypeCommand request, CancellationToken cancellationToken)
    {
        var menuType = await _unitOfWork.Repository<MenuType>().Entities.Where(x => x.Id == request.Id).FirstOrDefaultAsync();

        if (menuType == null)
        {
            return Result<GetMenuTypeDto>.BadRequest("Id not found");
        }

        var mapMenuType = _mapper.Map(request.CreateMenuTypeCommand, menuType);

        await _unitOfWork.Repository<MenuType>().UpdateAsync(mapMenuType, request.Id);
        await _unitOfWork.Save(cancellationToken);

        return Result<GetMenuTypeDto>.Success("Updated.....");
    }
}
