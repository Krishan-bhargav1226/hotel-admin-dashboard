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

public class UpdateLostItemCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreateLostItemCommand CreateCommand { get; set; }

    public UpdateLostItemCommand(int id, CreateLostItemCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdateLostItemCommandHandler : IRequestHandler<UpdateLostItemCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public UpdateLostItemCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(UpdateLostItemCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        await Validate(request.CreateCommand, cancellationToken);

        var entity = await _unitOfWork.Repository<LostItem>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("LostItem does not exist.");

        _mapper.Map(request.CreateCommand, entity);

        await _unitOfWork.Repository<LostItem>().UpdateAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("LostItem updated successfully.");
    }

    private async Task Validate(CreateLostItemCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<LostItemCategory>( (int)request.Category );
        _validationManager.ValidateEnum<LostItemStatus>( (int)request.Status );
        await Task.CompletedTask;
    }

}
