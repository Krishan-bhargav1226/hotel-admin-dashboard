using Application.Common.Mappings.Commons;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.Menus;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using AutoMapper;
using Domain.Entities.Menus;
using MediatR;
using Microsoft.AspNetCore.Http;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Menus.Commands;

public class CreateMenuCommand : IRequest<Result<Menu>>, ICreateMapFrom<Menu>
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
    public string Name { get; set; }

    [StringLength(500, ErrorMessage = "URL cannot exceed 500 characters")]
    public string? URL { get; set; }

    [StringLength(100, ErrorMessage = "Icon cannot exceed 100 characters")]
    public string? Icon { get; set; }

    public IFormFile? ImageURL { get; set; }

    [StringLength(200, ErrorMessage = "SubTitle cannot exceed 200 characters")]
    public string? SubTitle { get; set; }

    [StringLength(100, ErrorMessage = "QueryString1 cannot exceed 100 characters")]
    public string? QueryString1 { get; set; }

    [StringLength(100, ErrorMessage = "QueryString2 cannot exceed 100 characters")]
    public string? QueryString2 { get; set; }

    [StringLength(100, ErrorMessage = "ClaimValue cannot exceed 100 characters")]
    public string? ClaimValue { get; set; }

    [Required(ErrorMessage = "MenuTypeId is required")]
    public int MenuTypeId { get; set; }

    public int? BlogId { get; set; }
    public Guid? ParentId { get; set; }
}
internal class CreateMenuCommandHandler : IRequestHandler<CreateMenuCommand, Result<Menu>>
{
    private readonly IMenuRepository _menuRepository;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private readonly ICreateDocumentPath _createDocumentPath;

    public CreateMenuCommandHandler(IMenuRepository menuRepository, IMapper mapper, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository, ICreateDocumentPath createDocumentPath)
    {
        _menuRepository = menuRepository;
        _mapper = mapper;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<Menu>> Handle(CreateMenuCommand request, CancellationToken cancellationToken)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return Result<Menu>.BadRequest("Organization not found.");
        }

        var menu = await _menuRepository.Create(request);

        return Result<Menu>.Success(menu, "Menu created successfully.");
    }
}
