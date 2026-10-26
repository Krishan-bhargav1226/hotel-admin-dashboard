using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Properties.Commands;

public class DeletePropertyCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeletePropertyCommand(int id)
    {
        Id = id;
    }
}

internal class DeletePropertyCommandHandler : IRequestHandler<DeletePropertyCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public DeletePropertyCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(DeletePropertyCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var exists = await _unitOfWork.Repository<HotelProperty>().Entities
            .AnyAsync(x => x.Id == request.Id, cancellationToken);
        if (!exists)
            return Result<string>.BadRequest("Property does not exist.");

        await _unitOfWork.Repository<HotelProperty>().DeleteAsync(request.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Property deleted successfully.");
    }
}
