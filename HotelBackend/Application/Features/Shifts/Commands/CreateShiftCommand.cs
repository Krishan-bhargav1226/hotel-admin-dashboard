using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.Shifts;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Shifts.Commands;

public class CreateShiftCommand : IRequest<Result<int>>, ICreateMapFrom<ShiftRegister>
{
    public DateOnly ShiftDate { get; set; }
    public ShiftType ShiftType { get; set; }
    [Required(ErrorMessage = "StaffName is required")]
    [StringLength(150)]
    public string StaffName { get; set; } = string.Empty;
    public decimal OpeningCash { get; set; }
    public decimal CashCollected { get; set; }
    public decimal PettyExpensesPaid { get; set; }
    public decimal ClosingCashExpected { get; set; }
    public decimal ActualCashCounted { get; set; }
    public decimal CashDifference { get; set; }
    [StringLength(1000)]
    public string? HandoverNotes { get; set; }
}

internal class CreateShiftCommandHandler : IRequestHandler<CreateShiftCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreateShiftCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreateShiftCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        await Validate(request, cancellationToken);

        var entity = _mapper.Map<ShiftRegister>(request);

        entity.ClosingCashExpected = entity.OpeningCash + entity.CashCollected - entity.PettyExpensesPaid;
        entity.CashDifference = entity.ActualCashCounted - entity.ClosingCashExpected;

        await _unitOfWork.Repository<ShiftRegister>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(entity.Id, "Shift created successfully.");
    }

    private async Task Validate(CreateShiftCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<ShiftType>( (int)request.ShiftType );
        await Task.CompletedTask;
    }

}
