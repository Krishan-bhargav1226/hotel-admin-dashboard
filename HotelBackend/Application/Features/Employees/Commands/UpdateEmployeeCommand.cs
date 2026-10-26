using Application.Dto.Employees;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.Employees;
using Domain.Entities.UserAddresses;
using Domain.Entities.UserProfiles;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Employees.Commands;

public class UpdateEmployeeCommand : IRequest<Result<string>>
{
    [Required(ErrorMessage = "Id is required")]
    public int Id { get; set; }
    public UpdateEmployeeDto CreateCommand { get; set; } = new();

    public UpdateEmployeeCommand(int id, UpdateEmployeeDto createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}


internal class UpdateEmployeeCommandHandler : IRequestHandler<UpdateEmployeeCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICreateDocumentPath _createDocumentPath;

    public UpdateEmployeeCommandHandler(
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

    public async Task<Result<string>> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return Result<string>.BadRequest("Organization not found.");
        }

        // Get employee with user
        var employee = await _unitOfWork.Repository<Employee>().Entities
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == request.Id && !e.IsDeleted, cancellationToken);

        if (employee == null)
        {
            return Result<string>.NotFound("Employee not found.");
        }

        var user = employee.User;
        if (user == null)
        {
            return Result<string>.BadRequest("Associated user not found.");
        }

        // Update user information - only update non-null fields
        if (request.CreateCommand.FirstName != null)
            user.FirstName = request.CreateCommand.FirstName;
        if (request.CreateCommand.LastName != null)
            user.LastName = request.CreateCommand.LastName;
        if (request.CreateCommand.OtherDetails != null)
            user.OtherDetails = request.CreateCommand.OtherDetails;

        var updateUserResult = await _userManager.UpdateAsync(user);
        if (!updateUserResult.Succeeded)
        {
            var errors = string.Join(", ", updateUserResult.Errors.Select(e => e.Description));
            return Result<string>.BadRequest($"Failed to update user: {errors}");
        }

        // Update roles if provided
        if (request.CreateCommand.RoleIds != null && request.CreateCommand.RoleIds.Any())
        {
            // Validate roles exist
            foreach (var roleId in request.CreateCommand.RoleIds)
            {
                var roleExists = await _roleManager.Roles.AnyAsync(r => r.Id == roleId, cancellationToken);
                if (!roleExists)
                {
                    return Result<string>.BadRequest($"Role with ID {roleId} does not exist.");
                }
            }

            // Remove existing roles
            var existingRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, existingRoles);

            // Add new roles
            foreach (var roleId in request.CreateCommand.RoleIds)
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role != null)
                {
                    await _userManager.AddToRoleAsync(user, role.Name!);
                }
            }
        }

        // Update UserProfile if any profile fields are provided
        if (HasProfileFields(request))
        {
            await UpdateUserProfile(request, user.Id, cancellationToken);
        }

        // Update UserAddress if any address fields are provided
        if (HasAddressFields(request))
        {
            await UpdateUserAddress(request, user.Id, cancellationToken);
        }

        return Result<string>.Success(user.Id, "Employee updated successfully.");
    }

    private bool HasProfileFields(UpdateEmployeeCommand request)
    {
        return request.CreateCommand.Gender != null || request.CreateCommand.DOB != null || request.CreateCommand.MaritalStatus != null ||
               request.CreateCommand.ProfilePicture != null || request.CreateCommand.FacebookId != null ||
               request.CreateCommand.LinkedInId != null || request.CreateCommand.InstagramId != null;
    }

    private bool HasAddressFields(UpdateEmployeeCommand request)
    {
        return request.CreateCommand.Address1 != null || request.CreateCommand.Address2 != null || request.CreateCommand.CityId != null ||
               request.CreateCommand.StateId != null || request.CreateCommand.CountryId != null || request.CreateCommand.PinCode != null;
    }

    private async Task UpdateUserProfile(UpdateEmployeeCommand request, string userId, CancellationToken cancellationToken)
    {
        var userProfileExists = await _unitOfWork.Repository<UserProfile>()
            .Entities
            .AnyAsync(up => up.UserId == userId, cancellationToken);

        UserProfile userProfile;
        if (!userProfileExists)
        {
            // Create new profile if it doesn't exist
            userProfile = new UserProfile
            {
                UserId = userId,
                CreatedDate = DateTime.UtcNow
            };
            await _unitOfWork.Repository<UserProfile>().AddAsync(userProfile);
            await _unitOfWork.Save(cancellationToken);
        }
        else
        {
            userProfile = await _unitOfWork.Repository<UserProfile>()
                .Entities
                .FirstOrDefaultAsync(up => up.UserId == userId, cancellationToken);
        }

        // Update only non-null profile fields
        if (request.CreateCommand.Gender != null)
            userProfile.Gender = request.CreateCommand.Gender;
        if (request.CreateCommand.DOB != null)
            userProfile.DOB = request.CreateCommand.DOB;
        if (request.CreateCommand.MaritalStatus != null)
            userProfile.MaritalStatus = request.CreateCommand.MaritalStatus;
        if (request.CreateCommand.ProfilePicture != null)
        {
            _createDocumentPath.DeleteDocument(userProfile.ProfilePicture);
            userProfile.ProfilePicture = await _createDocumentPath.Create(request.CreateCommand.ProfilePicture);
        }
        if (request.CreateCommand.FacebookId != null)
            userProfile.FacebookId = request.CreateCommand.FacebookId;
        if (request.CreateCommand.LinkedInId != null)
            userProfile.LinkedInId = request.CreateCommand.LinkedInId;
        if (request.CreateCommand.InstagramId != null)
            userProfile.InstagramId = request.CreateCommand.InstagramId;

        await _unitOfWork.Repository<UserProfile>().UpdateAsync(userProfile);
        await _unitOfWork.Save(cancellationToken);
    }

    private async Task UpdateUserAddress(UpdateEmployeeCommand request, string userId, CancellationToken cancellationToken)
    {
        var userAddressExists = await _unitOfWork.Repository<UserAddress>()
            .Entities
            .AnyAsync(ua => ua.UserId == userId, cancellationToken);

        UserAddress userAddress;
        if (!userAddressExists)
        {
            // Create new address if it doesn't exist
            userAddress = new UserAddress
            {
                UserId = userId,
                CreatedDate = DateTime.UtcNow
            };
            await _unitOfWork.Repository<UserAddress>().AddAsync(userAddress);
            await _unitOfWork.Save(cancellationToken);
        }
        else
        {
            userAddress = await _unitOfWork.Repository<UserAddress>()
                .Entities
                .FirstOrDefaultAsync(ua => ua.UserId == userId, cancellationToken);
        }

        // Update only non-null address fields
        if (request.CreateCommand.Address1 != null)
            userAddress.Address1 = request.CreateCommand.Address1;
        if (request.CreateCommand.Address2 != null)
            userAddress.Address2 = request.CreateCommand.Address2;
        if (request.CreateCommand.CityId != null)
            userAddress.CityId = request.CreateCommand.CityId;
        if (request.CreateCommand.StateId != null)
            userAddress.StateId = request.CreateCommand.StateId;
        if (request.CreateCommand.CountryId != null)
            userAddress.CountryId = request.CreateCommand.CountryId;
        if (request.CreateCommand.PinCode != null)
            userAddress.PinCode = request.CreateCommand.PinCode;

        await _unitOfWork.Repository<UserAddress>().UpdateAsync(userAddress);
        await _unitOfWork.Save(cancellationToken);
    }
}
