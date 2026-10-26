using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.PosItems;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.PosItems.Commands;

public class CreatePosItemCommand : IRequest<Result<int>>, ICreateMapFrom<PosItem>
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;
    public MenuCategory Category { get; set; }
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
    [StringLength(500)]
    public string? Description { get; set; }
}

internal class CreatePosItemCommandHandler : IRequestHandler<CreatePosItemCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreatePosItemCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreatePosItemCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        await Validate(request, cancellationToken);

        var entity = _mapper.Map<PosItem>(request);

        await _unitOfWork.Repository<PosItem>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(entity.Id, "PosItem created successfully.");
    }

    private async Task Validate(CreatePosItemCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<MenuCategory>( (int)request.Category );
        await Task.CompletedTask;
    }

}
