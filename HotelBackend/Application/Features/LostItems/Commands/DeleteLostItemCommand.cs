using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.LostItems;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.LostItems.Commands;

public class DeleteLostItemCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeleteLostItemCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteLostItemCommandHandler : IRequestHandler<DeleteLostItemCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public DeleteLostItemCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(DeleteLostItemCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var exists = await _unitOfWork.Repository<LostItem>().Entities
            .AnyAsync(x => x.Id == request.Id, cancellationToken);
        if (!exists)
            return Result<string>.BadRequest("LostItem does not exist.");

        await _unitOfWork.Repository<LostItem>().DeleteAsync(request.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("LostItem deleted successfully.");
    }
}
