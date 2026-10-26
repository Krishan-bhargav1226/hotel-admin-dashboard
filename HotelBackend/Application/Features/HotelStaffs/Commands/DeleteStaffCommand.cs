using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.HotelStaffs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.HotelStaffs.Commands;

public class DeleteStaffCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeleteStaffCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteStaffCommandHandler : IRequestHandler<DeleteStaffCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public DeleteStaffCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(DeleteStaffCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var exists = await _unitOfWork.Repository<HotelStaff>().Entities
            .AnyAsync(x => x.Id == request.Id, cancellationToken);
        if (!exists)
            return Result<string>.BadRequest("Staff does not exist.");

        await _unitOfWork.Repository<HotelStaff>().DeleteAsync(request.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Staff deleted successfully.");
    }
}
