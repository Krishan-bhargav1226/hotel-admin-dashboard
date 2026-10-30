using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Repositories.Users.UserRoles;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Roles.Commands;

public class AssignUserAccessCommand : IRequest<Result<string>>
{
    public string UserId { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = [];
    public int? PropertyId { get; set; }
}

internal class AssignUserAccessCommandHandler : IRequestHandler<AssignUserAccessCommand, Result<string>>
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "SuperAdmin", "Admin", "Reception", "User"
    };

    private readonly IUserRoleRepository _repository;
    private readonly IUserIdAndOrganizationIdRepository _caller;
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<User> _userManager;

    public AssignUserAccessCommandHandler(
        IUserRoleRepository repository,
        IUserIdAndOrganizationIdRepository caller,
        IUnitOfWork unitOfWork,
        UserManager<User> userManager)
    {
        _repository = repository;
        _caller = caller;
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<Result<string>> Handle(AssignUserAccessCommand request, CancellationToken cancellationToken)
    {
        var current = await _caller.Get();
        if (!current.IsSuperAdmin)
            return Result<string>.BadRequest("Only a Super Admin can assign a role or hotel.");

        var role = request.Roles.FirstOrDefault(item => !string.IsNullOrWhiteSpace(item))?.Trim();
        if (role == null || !AllowedRoles.Contains(role))
            return Result<string>.BadRequest("Choose SuperAdmin, Admin, Reception, or User.");

        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null || user.IsDeleted)
            return Result<string>.BadRequest("User does not exist.");
        if (!user.EmailConfirmed)
            return Result<string>.BadRequest("This user has not verified their email yet.");

        var isSuperAdmin = role.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase);
        if (!isSuperAdmin && role is not "User" && request.PropertyId == null)
            return Result<string>.BadRequest("Choose a hotel for this role.");

        if (request.PropertyId != null)
        {
            var propertyExists = await _unitOfWork.Repository<HotelProperty>().Entities
                .AnyAsync(x => x.Id == request.PropertyId, cancellationToken);
            if (!propertyExists)
                return Result<string>.BadRequest("The selected hotel does not exist.");
        }

        user.PropertyId = isSuperAdmin ? null : request.PropertyId;
        user.UpdatedDate = DateTime.UtcNow;
        var updated = await _userManager.UpdateAsync(user);
        if (!updated.Succeeded)
            return Result<string>.BadRequest(string.Join(", ", updated.Errors.Select(error => error.Description)));

        await _repository.CreateUpdateUserRole(request.UserId, [role]);
        return Result<string>.Success("Role and hotel assignment saved.");
    }
}
