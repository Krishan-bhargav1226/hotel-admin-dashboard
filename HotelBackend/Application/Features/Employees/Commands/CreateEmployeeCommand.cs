using Application.Common.Mappings.Commons;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Employees;
using Domain.Common.Enums.Users;
using Domain.Commons.Enums.Users;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.Employees;
using Domain.Entities.UserAddresses;
using Domain.Entities.UserProfiles;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Employees.Commands;

public class CreateEmployeeCommand : IRequest<Result<int>>
{
    // User fields
    [Required(ErrorMessage = "FirstName is required")]
    [StringLength(50, ErrorMessage = "FirstName cannot exceed 50 characters")]
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    [Required]
    [EmailAddress(ErrorMessage = "Invalid email address format")]
    public string Email { get; set; }

    [Required]
    [Phone(ErrorMessage = "Invalid phone number format")]
    public string PhoneNumber { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
    public string Password { get; set; } = string.Empty;

    public string? OtherDetails { get; set; }

    // Profile fields
    public Gender? Gender { get; set; }
    public DateOnly? DOB { get; set; }
    public MaritalStatus? MaritalStatus { get; set; }
    public IFormFile? ProfilePicture { get; set; }
    public string? FacebookId { get; set; }
    public string? LinkedInId { get; set; }
    public string? InstagramId { get; set; }

    // Address fields
    public string? Address1 { get; set; }
    public string? Address2 { get; set; }
    public int? CityId { get; set; }
    public int? StateId { get; set; }
    public int? CountryId { get; set; }
    public int? PinCode { get; set; }

    // Role fields
    [Required(ErrorMessage = "At least one role is required")]
    public List<string> RoleIds { get; set; } = new();
}

internal class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, Result<int>>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICreateDocumentPath _createDocumentPath;

    public CreateEmployeeCommandHandler(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        IMapper mapper,
        IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository,
        IUnitOfWork unitOfWork,
        ICreateDocumentPath createDocumentPath)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _mapper = mapper;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
        _unitOfWork = unitOfWork;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<int>> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return Result<int>.BadRequest("Organization not found.");
        }

        // Check if user with this email already exists
        if (request.Email != null)
        {
            var existingUser = await _userManager.Users
                .AnyAsync(x => x.Email != null && x.Email.ToLower() == request.Email.ToLower() && x.EmailConfirmed, cancellationToken);
            if (existingUser)
            {
                return Result<int>.BadRequest("User with this email already exists.");
            }
        }

        if (request.PhoneNumber != null)
        {
            var existingUser = await _userManager.Users
                .AnyAsync(x => x.PhoneNumber != null && x.PhoneNumber == request.PhoneNumber && x.PhoneNumberConfirmed, cancellationToken);
            if (existingUser)
            {
                return Result<int>.BadRequest("User with this phone number already exists.");
            }
        }

        // Create new user
        var user = new User
        {
            UserName = Guid.NewGuid().ToString(),
            Email = request.Email?.ToLower(),
            PhoneNumber = request.PhoneNumber,
            FirstName = request.FirstName,
            LastName = request.LastName,
            OtherDetails = request.OtherDetails,
            OrganizationId = userOrgInfo.OrganizationId.Value,
            EmailConfirmed = true, 
            PhoneNumberConfirmed = true ,
            UserType = UserType.Employee,
        };

        var createUserResult = await _userManager.CreateAsync(user, request.Password);
        if (!createUserResult.Succeeded)
        {
            var errors = string.Join(", ", createUserResult.Errors.Select(e => e.Description));
            return Result<int>.BadRequest($"Failed to create user: {errors}");
        }

        // Assign roles
        foreach (var roleId in request.RoleIds)
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            if (role != null)
            {
                await _userManager.AddToRoleAsync(user, role.Name!);
            }
        }

        // Create user profile if profile fields are provided
        if (HasProfileFields(request))
        {
            await CreateUserProfile(request, user.Id, cancellationToken);
        }

        // Create user address if address fields are provided
        if (HasAddressFields(request))
        {
            await CreateUserAddress(request, user.Id, cancellationToken);
        }

        // Create employee record
        var employee = new Employee
        {
            UserId = user.Id,
            CreatedDate = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Employee>().AddAsync(employee);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success(employee.Id, "Employee created successfully.");
    }

    private bool HasProfileFields(CreateEmployeeCommand request)
    {
        return request.Gender != null || request.DOB != null || request.MaritalStatus != null ||
               request.ProfilePicture != null || request.FacebookId != null || 
               request.LinkedInId != null || request.InstagramId != null;
    }

    private bool HasAddressFields(CreateEmployeeCommand request)
    {
        return request.Address1 != null || request.Address2 != null || request.CityId != null ||
               request.StateId != null || request.CountryId != null || request.PinCode != null;
    }

    private async Task CreateUserProfile(CreateEmployeeCommand request, string userId, CancellationToken cancellationToken)
    {
        var userProfile = new UserProfile
        {
            UserId = userId,
            Gender = request.Gender,
            DOB = request.DOB,
            MaritalStatus = request.MaritalStatus,
            FacebookId = request.FacebookId,
            LinkedInId = request.LinkedInId,
            InstagramId = request.InstagramId,
            CreatedDate = DateTime.UtcNow
        };

        if (request.ProfilePicture != null)
        {
            userProfile.ProfilePicture = await _createDocumentPath.Create(request.ProfilePicture);
        }

        await _unitOfWork.Repository<UserProfile>().AddAsync(userProfile);
        await _unitOfWork.Save(cancellationToken);
    }

    private async Task CreateUserAddress(CreateEmployeeCommand request, string userId, CancellationToken cancellationToken)
    {
        var userAddress = new UserAddress
        {
            UserId = userId,
            Address1 = request.Address1 ?? string.Empty,
            Address2 = request.Address2,
            CityId = request.CityId,
            StateId = request.StateId,
            CountryId = request.CountryId,
            PinCode = request.PinCode,
            CreatedDate = DateTime.UtcNow
        };

        await _unitOfWork.Repository<UserAddress>().AddAsync(userAddress);
        await _unitOfWork.Save(cancellationToken);
    }
}
