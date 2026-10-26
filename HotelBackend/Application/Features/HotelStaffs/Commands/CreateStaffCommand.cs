using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.HotelStaffs;
using Domain.Entities.Hotels;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.HotelStaffs.Commands;

public class CreateStaffCommand : IRequest<Result<int>>, ICreateMapFrom<HotelStaff>
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;
    public StaffRole Role { get; set; }
    [Required(ErrorMessage = "Phone is required")]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;
    [StringLength(150)]
    public string? Email { get; set; }
    public ShiftType Shift { get; set; }
    public DutyStatus DutyStatus { get; set; }
    public DateOnly JoinedDate { get; set; }
    public int? PropertyId { get; set; }
}

internal class CreateStaffCommandHandler : IRequestHandler<CreateStaffCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreateStaffCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        if ((int)request.DutyStatus == 0)
            request.DutyStatus = DutyStatus.OFF_DUTY;

        await Validate(request, cancellationToken);

        var entity = _mapper.Map<HotelStaff>(request);

        if (entity.PropertyId != null)
        {
            var property = await _unitOfWork.Repository<HotelProperty>().GetByID(entity.PropertyId.Value);
            entity.PropertyName = property?.Name;
        }

        await _unitOfWork.Repository<HotelStaff>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(entity.Id, "Staff created successfully.");
    }

    private async Task Validate(CreateStaffCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<StaffRole>( (int)request.Role );
        _validationManager.ValidateEnum<ShiftType>( (int)request.Shift );
        _validationManager.ValidateEnum<DutyStatus>( (int)request.DutyStatus );
        await _validationManager.ValidateId<HotelProperty>(request.PropertyId);
    }

}
