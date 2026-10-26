using Application.Common.Mappings.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.MenuTypes;
using MediatR;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Menus.MenuTypes.Commands;

public class CreateMenuTypeCommand : IRequest<Result<int>>, ICreateMapFrom<MenuType>
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
    public string Name { get; set; }

    [StringLength(100, ErrorMessage = "Icon cannot exceed 100 characters")]
    public string? Icon { get; set; }
}

internal class CreateMenuTypeCommandHandler : IRequestHandler<CreateMenuTypeCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;

    public CreateMenuTypeCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
    }

    public async Task<Result<int>> Handle(CreateMenuTypeCommand request, CancellationToken cancellationToken)
    {
        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        if (userOrgInfo.OrganizationId == null)
        {
            return Result<int>.BadRequest("Organization not found.");
        }

        var menuType = _mapper.Map<MenuType>(request);
        menuType.OrganizationId = userOrgInfo.OrganizationId.Value;
        menuType.CreatedDate = DateTime.UtcNow;

        await _unitOfWork.Repository<MenuType>().AddAsync(menuType);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success(menuType.Id, "MenuType created successfully.");
    }
}
