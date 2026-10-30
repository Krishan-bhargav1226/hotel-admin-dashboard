using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Hotels;
using Domain.Common.Enums.Users;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.OTPs;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.AspNetCore.Identity;
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

    [StringLength(50)]
    public string? VenueAdminFirstName { get; set; }
    [StringLength(50)]
    public string? VenueAdminLastName { get; set; }
    [StringLength(150)]
    public string? VenueAdminEmail { get; set; }
    [StringLength(20)]
    public string? VenueAdminPhone { get; set; }
    [StringLength(30)]
    public string? VenueAdminPassword { get; set; }
    public int? VenueAdminOtp { get; set; }
}

internal class CreatePropertyCommandHandler : IRequestHandler<CreatePropertyCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;

    public CreatePropertyCommandHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ValidationManager validationManager,
        IUserIdAndOrganizationIdRepository userOrganizationRepository,
        UserManager<User> userManager,
        RoleManager<Role> roleManager)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<Result<int>> Handle(CreatePropertyCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (!userOrg.IsSuperAdmin)
            return Result<int>.BadRequest("Only a Super Admin can add a hotel.");
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        if ((int)request.Status == 0)
            request.Status = PropertyStatus.ACTIVE;

        var email = request.VenueAdminEmail?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(request.VenueAdminFirstName) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.VenueAdminPassword))
            return Result<int>.BadRequest("Venue admin name, email, and password are required.");
        if (request.VenueAdminOtp == null)
            return Result<int>.BadRequest("Verify the venue admin email with the 6-digit code before creating the hotel.");

        try
        {
            _validationManager.ValidatePassword(request.VenueAdminPassword);
            _validationManager.ValidateEnum<PropertyStatus>((int)request.Status);
        }
        catch (Exception exception)
        {
            return Result<int>.BadRequest(exception.Message);
        }

        var emailTaken = await _userManager.Users.AnyAsync(x => x.Email != null && x.Email.ToLower() == email, cancellationToken);
        if (emailTaken)
            return Result<int>.BadRequest("This venue admin email already has an account.");

        var otp = await _unitOfWork.Repository<OTP>().Entities
            .Where(x => x.Email == email && x.ForOtp == "VenueAdmin")
            .OrderByDescending(x => x.CreatedDate)
            .FirstOrDefaultAsync(cancellationToken);
        var reason = OtpConfirmation.RejectReason(otp, request.VenueAdminOtp.Value);
        if (reason != null)
        {
            if (otp != null)
            {
                await _unitOfWork.Repository<OTP>().UpdateAsync(otp, otp.Id);
                await _unitOfWork.Save(cancellationToken);
            }
            return Result<int>.BadRequest(reason);
        }

        var entity = _mapper.Map<HotelProperty>(request);
        entity.Email = string.IsNullOrWhiteSpace(request.Email) ? email : request.Email.Trim();
        await _unitOfWork.Repository<HotelProperty>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);

        var admin = new User
        {
            UserName = email,
            Email = email,
            PhoneNumber = request.VenueAdminPhone?.Trim(),
            FirstName = request.VenueAdminFirstName.Trim(),
            LastName = request.VenueAdminLastName?.Trim() ?? string.Empty,
            OrganizationId = userOrg.OrganizationId.Value,
            PropertyId = entity.Id,
            EmailConfirmed = true,
            IsActive = true,
            CreatedDate = DateTime.UtcNow,
            UserType = UserType.Employee
        };
        var created = await _userManager.CreateAsync(admin, request.VenueAdminPassword);
        if (!created.Succeeded)
            return Result<int>.BadRequest(string.Join(", ", created.Errors.Select(error => error.Description)));

        if (!await _roleManager.RoleExistsAsync("Admin"))
            await _roleManager.CreateAsync(new Role { Name = "Admin", OrganizationId = userOrg.OrganizationId.Value });
        await _userManager.AddToRoleAsync(admin, "Admin");

        await _unitOfWork.Repository<OTP>().DeleteAsync(otp!);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(entity.Id, "Hotel created after the venue admin email was verified.");
    }
}
