using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Shifts;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Shifts.Commands;

public class DeleteShiftCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeleteShiftCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteShiftCommandHandler : IRequestHandler<DeleteShiftCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public DeleteShiftCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(DeleteShiftCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var exists = await _unitOfWork.Repository<ShiftRegister>().Entities
            .AnyAsync(x => x.Id == request.Id, cancellationToken);
        if (!exists)
            return Result<string>.BadRequest("Shift does not exist.");

        await _unitOfWork.Repository<ShiftRegister>().DeleteAsync(request.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Shift deleted successfully.");
    }
}
