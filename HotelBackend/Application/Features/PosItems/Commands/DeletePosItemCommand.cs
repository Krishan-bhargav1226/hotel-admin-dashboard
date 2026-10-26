using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.PosItems;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.PosItems.Commands;

public class DeletePosItemCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeletePosItemCommand(int id)
    {
        Id = id;
    }
}

internal class DeletePosItemCommandHandler : IRequestHandler<DeletePosItemCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public DeletePosItemCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(DeletePosItemCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var exists = await _unitOfWork.Repository<PosItem>().Entities
            .AnyAsync(x => x.Id == request.Id, cancellationToken);
        if (!exists)
            return Result<string>.BadRequest("PosItem does not exist.");

        await _unitOfWork.Repository<PosItem>().DeleteAsync(request.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("PosItem deleted successfully.");
    }
}
