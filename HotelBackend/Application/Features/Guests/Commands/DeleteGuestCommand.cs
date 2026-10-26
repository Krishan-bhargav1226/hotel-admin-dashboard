using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Guests;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Guests.Commands;

public class DeleteGuestCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeleteGuestCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteGuestCommandHandler : IRequestHandler<DeleteGuestCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public DeleteGuestCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(DeleteGuestCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var exists = await _unitOfWork.Repository<Guest>().Entities
            .AnyAsync(x => x.Id == request.Id, cancellationToken);
        if (!exists)
            return Result<string>.BadRequest("Guest does not exist.");

        await _unitOfWork.Repository<Guest>().DeleteAsync(request.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Guest deleted successfully.");
    }
}
