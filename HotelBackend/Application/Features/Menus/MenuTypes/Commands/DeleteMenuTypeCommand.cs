using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.MenuTypes;
using MediatR;
using Shared;

namespace Application.Features.Menus.MenuTypes.Commands;

public class DeleteMenuTypeCommand : IRequest<Result<int>>
{
    public int Id { get; set; }
    public DeleteMenuTypeCommand(int id)
    {
        Id = id;
    }
}
internal class DeleteMenuTypeCommandHandler : IRequestHandler<DeleteMenuTypeCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    public DeleteMenuTypeCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    public async Task<Result<int>> Handle(DeleteMenuTypeCommand request, CancellationToken cancellationToken)
    {
        var menuType = await _unitOfWork.Repository<MenuType>().GetByID(request.Id);

        if (menuType == null)
        {
            return Result<int>.BadRequest("Id not found");
        }

        var mapMenuType = _mapper.Map<MenuType>(menuType);

        await _unitOfWork.Repository<MenuType>().DeleteAsync(mapMenuType);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success("Deleted.....");
    }
}
