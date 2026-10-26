using Application.Common.Mappings.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Entities.ApplicationRoles;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Roles.Command;

public class CreateRoleCommand : IRequest<Result<int>>, ICreateMapFrom<Role>
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
    public string Name { get; set; }
}
internal class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Result<int>>
{
    private readonly RoleManager<Role> _roleManager;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;

    public CreateRoleCommandHandler(RoleManager<Role> roleManager, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _roleManager = roleManager;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
    }

    public async Task<Result<int>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return Result<int>.BadRequest("Organization not found.");
        }

        var role = new Role()
        {
            Name = request.Name,
            OrganizationId = userOrgInfo.OrganizationId.Value,
            NormalizedName = request.Name.ToUpper()
        };

        var result = await _roleManager.CreateAsync(role);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result<int>.BadRequest($"Failed to create role: {errors}");
        }

        return Result<int>.Success(1, "Role created successfully.");
    }
}
