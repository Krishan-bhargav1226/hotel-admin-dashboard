using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Hotels;
using Domain.Entities.PosItems;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.PosItems.Commands;

public class UpdatePosItemCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreatePosItemCommand CreateCommand { get; set; }

    public UpdatePosItemCommand(int id, CreatePosItemCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdatePosItemCommandHandler : IRequestHandler<UpdatePosItemCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public UpdatePosItemCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(UpdatePosItemCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        await Validate(request.CreateCommand, cancellationToken);

        var entity = await _unitOfWork.Repository<PosItem>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("PosItem does not exist.");

        _mapper.Map(request.CreateCommand, entity);

        await _unitOfWork.Repository<PosItem>().UpdateAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("PosItem updated successfully.");
    }

    private async Task Validate(CreatePosItemCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<MenuCategory>( (int)request.Category );
        await Task.CompletedTask;
    }

}
