using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.Organization;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Employees;
using Domain.Commons.Enums.Users;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.UserAddresses;
using Domain.Entities.UserProfiles;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Application.Features.Users.Commands;

public class UpdateUserCommand : IRequest<Result<string>>
{
    [Required(ErrorMessage = "Id is required")]
    public string Id { get; set; }

    [StringLength(50, ErrorMessage = "FirstName cannot exceed 50 characters")]
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
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
}

internal class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly IOrganizationRepository _organizationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICreateDocumentPath _createDocumentPath;

    public UpdateUserCommandHandler(UserManager<User> userManager, IMapper mapper, IOrganizationRepository organizationRepository, IUnitOfWork unitOfWork, ICreateDocumentPath createDocumentPath)
    {
        _userManager = userManager;
        _mapper = mapper;
        _organizationRepository = organizationRepository;
        _unitOfWork = unitOfWork;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<string>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.Id);
        if (user == null)
        {
            return Result<string>.NotFound("User not found.");
        }

        // Update user information - only update non-null fields
        if (request.FirstName != null)
            user.FirstName = request.FirstName;
        if (request.LastName != null)
            user.LastName = request.LastName;
        if (request.OtherDetails != null)
            user.OtherDetails = request.OtherDetails;

        var updateUserResult = await _userManager.UpdateAsync(user);
        if (!updateUserResult.Succeeded)
        {
            var errors = string.Join(", ", updateUserResult.Errors.Select(e => e.Description));
            return Result<string>.BadRequest($"Failed to update user: {errors}");
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

        return Result<string>.Success(user.Id, "User updated successfully.");
    }

    private bool HasProfileFields(UpdateUserCommand request)
    {
        return request.Gender != null || request.DOB != null || request.MaritalStatus != null ||
               request.ProfilePicture != null || request.FacebookId != null ||
               request.LinkedInId != null || request.InstagramId != null;
    }

    private bool HasAddressFields(UpdateUserCommand request)
    {
        return request.Address1 != null || request.Address2 != null || request.CityId != null ||
               request.StateId != null || request.CountryId != null || request.PinCode != null;
    }

    private async Task UpdateUserProfile(UpdateUserCommand request, string userId, CancellationToken cancellationToken)
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
                UserId = userId
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
        if (request.Gender != null)
            userProfile.Gender = request.Gender;
        if (request.DOB != null)
            userProfile.DOB = request.DOB;
        if (request.MaritalStatus != null)
            userProfile.MaritalStatus = request.MaritalStatus;
        if (request.ProfilePicture != null)
        {
            _createDocumentPath.DeleteDocument(userProfile.ProfilePicture);
            userProfile.ProfilePicture = await _createDocumentPath.Create(request.ProfilePicture);
        }
        if (request.FacebookId != null)
            userProfile.FacebookId = request.FacebookId;
        if (request.LinkedInId != null)
            userProfile.LinkedInId = request.LinkedInId;
        if (request.InstagramId != null)
            userProfile.InstagramId = request.InstagramId;

        await _unitOfWork.Repository<UserProfile>().UpdateAsync(userProfile);
        await _unitOfWork.Save(cancellationToken);
    }

    private async Task UpdateUserAddress(UpdateUserCommand request, string userId, CancellationToken cancellationToken)
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
                UserId = userId
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
        if (request.Address1 != null)
            userAddress.Address1 = request.Address1;
        if (request.Address2 != null)
            userAddress.Address2 = request.Address2;
        if (request.CityId != null)
            userAddress.CityId = request.CityId;
        if (request.StateId != null)
            userAddress.StateId = request.StateId;
        if (request.CountryId != null)
            userAddress.CountryId = request.CountryId;
        if (request.PinCode != null)
            userAddress.PinCode = request.PinCode;

        await _unitOfWork.Repository<UserAddress>().UpdateAsync(userAddress);
        await _unitOfWork.Save(cancellationToken);
    }
}
