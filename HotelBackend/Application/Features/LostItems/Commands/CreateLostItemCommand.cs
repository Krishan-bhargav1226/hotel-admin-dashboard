using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.LostItems;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.LostItems.Commands;

public class CreateLostItemCommand : IRequest<Result<int>>, ICreateMapFrom<LostItem>
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(150)]
    public string Title { get; set; } = string.Empty;
    public LostItemCategory Category { get; set; }
    [StringLength(150)]
    public string? LocationFound { get; set; }
    [StringLength(20)]
    public string? RoomNumber { get; set; }
    public DateOnly FoundDate { get; set; }
    [StringLength(10)]
    public string? FoundTime { get; set; }
    [StringLength(100)]
    public string? FoundByStaff { get; set; }
    [StringLength(50)]
    public string? StorageLocker { get; set; }
    [StringLength(150)]
    public string? GuestName { get; set; }
    [StringLength(20)]
    public string? GuestPhone { get; set; }
    public LostItemStatus Status { get; set; }
    [StringLength(500)]
    public string? Notes { get; set; }
    [StringLength(150)]
    public string? ClaimedBy { get; set; }
    [StringLength(50)]
    public string? ClaimantContact { get; set; }
}

internal class CreateLostItemCommandHandler : IRequestHandler<CreateLostItemCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreateLostItemCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreateLostItemCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        if ((int)request.Status == 0)
            request.Status = LostItemStatus.SECURED;

        await Validate(request, cancellationToken);

        var entity = _mapper.Map<LostItem>(request);

        var count = await _unitOfWork.Repository<LostItem>().Entities.IgnoreQueryFilters()
            .CountAsync(x => x.OrganizationId == userOrg.OrganizationId, cancellationToken);
        entity.ItemNo = Application.Common.Helpers.CodeGenerator.Next("LF", count);

        await _unitOfWork.Repository<LostItem>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(entity.Id, "LostItem created successfully.");
    }

    private async Task Validate(CreateLostItemCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<LostItemCategory>( (int)request.Category );
        _validationManager.ValidateEnum<LostItemStatus>( (int)request.Status );
        await Task.CompletedTask;
    }

}
