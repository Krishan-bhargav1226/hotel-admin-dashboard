using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.HotelStaffs;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.HotelStaffs.Commands;

public class UpdateStaffCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreateStaffCommand CreateCommand { get; set; }

    public UpdateStaffCommand(int id, CreateStaffCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdateStaffCommandHandler : IRequestHandler<UpdateStaffCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public UpdateStaffCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        await Validate(request.CreateCommand, cancellationToken);

        var entity = await _unitOfWork.Repository<HotelStaff>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("Staff does not exist.");

        _mapper.Map(request.CreateCommand, entity);

        if (entity.PropertyId != null)
        {
            var property = await _unitOfWork.Repository<HotelProperty>().GetByID(entity.PropertyId.Value);
            entity.PropertyName = property?.Name;
        }

        await _unitOfWork.Repository<HotelStaff>().UpdateAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Staff updated successfully.");
    }

    private async Task Validate(CreateStaffCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<StaffRole>( (int)request.Role );
        _validationManager.ValidateEnum<ShiftType>( (int)request.Shift );
        _validationManager.ValidateEnum<DutyStatus>( (int)request.DutyStatus );
        await _validationManager.ValidateId<HotelProperty>(request.PropertyId);
    }

}
