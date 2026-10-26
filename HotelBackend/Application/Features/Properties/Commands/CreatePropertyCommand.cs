using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Properties.Commands;

public class CreatePropertyCommand : IRequest<Result<int>>, ICreateMapFrom<HotelProperty>
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;
    [StringLength(150)]
    public string? Chain { get; set; }
    [StringLength(50)]
    public string? BrandTier { get; set; }
    [StringLength(150)]
    public string? Location { get; set; }
    [StringLength(20)]
    public string? StarRating { get; set; }
    public int RoomCount { get; set; }
    public decimal OccupancyRate { get; set; }
    [StringLength(20)]
    public string? Phone { get; set; }
    [StringLength(150)]
    public string? Email { get; set; }
    [StringLength(300)]
    public string? Address { get; set; }
    [StringLength(20)]
    public string? Gstin { get; set; }
    [StringLength(100)]
    public string? UpiId { get; set; }
    public decimal DailyRevenue { get; set; }
    public decimal Adr { get; set; }
    [StringLength(100)]
    public string? ManagerName { get; set; }
    public PropertyStatus Status { get; set; }
}

internal class CreatePropertyCommandHandler : IRequestHandler<CreatePropertyCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreatePropertyCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreatePropertyCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        if ((int)request.Status == 0)
            request.Status = PropertyStatus.ACTIVE;

        await Validate(request, cancellationToken);

        var entity = _mapper.Map<HotelProperty>(request);

        await _unitOfWork.Repository<HotelProperty>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(entity.Id, "Property created successfully.");
    }

    private async Task Validate(CreatePropertyCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<PropertyStatus>( (int)request.Status );
        await Task.CompletedTask;
    }

}
