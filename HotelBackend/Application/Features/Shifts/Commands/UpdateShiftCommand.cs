using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Shifts;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Shifts.Commands;

public class UpdateShiftCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreateShiftCommand CreateCommand { get; set; }

    public UpdateShiftCommand(int id, CreateShiftCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdateShiftCommandHandler : IRequestHandler<UpdateShiftCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public UpdateShiftCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(UpdateShiftCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        await Validate(request.CreateCommand, cancellationToken);

        var entity = await _unitOfWork.Repository<ShiftRegister>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("Shift does not exist.");

        _mapper.Map(request.CreateCommand, entity);

        entity.ClosingCashExpected = entity.OpeningCash + entity.CashCollected - entity.PettyExpensesPaid;
        entity.CashDifference = entity.ActualCashCounted - entity.ClosingCashExpected;

        await _unitOfWork.Repository<ShiftRegister>().UpdateAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Shift updated successfully.");
    }

    private async Task Validate(CreateShiftCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<ShiftType>( (int)request.ShiftType );
        await Task.CompletedTask;
    }

}
