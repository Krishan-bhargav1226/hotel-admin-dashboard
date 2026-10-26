using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.RatePlans;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.RatePlans.Commands;

public class DeleteRatePlanCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeleteRatePlanCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteRatePlanCommandHandler : IRequestHandler<DeleteRatePlanCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public DeleteRatePlanCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(DeleteRatePlanCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var exists = await _unitOfWork.Repository<RatePlan>().Entities.AnyAsync(x => x.Id == request.Id, cancellationToken);
        if (!exists)
            return Result<string>.BadRequest("Rate plan does not exist.");

        var links = await _unitOfWork.Repository<RatePlanRoom>().Entities
            .Where(x => x.RatePlanId == request.Id)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);
        foreach (var id in links)
            await _unitOfWork.Repository<RatePlanRoom>().DeleteAsync(id);

        await _unitOfWork.Repository<RatePlan>().DeleteAsync(request.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Rate plan deleted successfully.");
    }
}
