using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.RoomTypes;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.RoomTypes.Commands;

public class DeleteRoomTypeCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeleteRoomTypeCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteRoomTypeCommandHandler : IRequestHandler<DeleteRoomTypeCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public DeleteRoomTypeCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(DeleteRoomTypeCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var exists = await _unitOfWork.Repository<RoomType>().Entities
            .AnyAsync(x => x.Id == request.Id, cancellationToken);
        if (!exists)
            return Result<string>.BadRequest("RoomType does not exist.");

        await _unitOfWork.Repository<RoomType>().DeleteAsync(request.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("RoomType deleted successfully.");
    }
}
