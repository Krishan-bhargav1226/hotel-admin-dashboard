using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Rooms.Commands;

public class DeleteRoomCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeleteRoomCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteRoomCommandHandler : IRequestHandler<DeleteRoomCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public DeleteRoomCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(DeleteRoomCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var exists = await _unitOfWork.Repository<Room>().Entities
            .AnyAsync(x => x.Id == request.Id, cancellationToken);
        if (!exists)
            return Result<string>.BadRequest("Room does not exist.");

        await _unitOfWork.Repository<Room>().DeleteAsync(request.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Room deleted successfully.");
    }
}
