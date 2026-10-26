using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Properties.Commands;

public class UpdatePropertyCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreatePropertyCommand CreateCommand { get; set; }

    public UpdatePropertyCommand(int id, CreatePropertyCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdatePropertyCommandHandler : IRequestHandler<UpdatePropertyCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public UpdatePropertyCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(UpdatePropertyCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        await Validate(request.CreateCommand, cancellationToken);

        var entity = await _unitOfWork.Repository<HotelProperty>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("Property does not exist.");

        _mapper.Map(request.CreateCommand, entity);

        await _unitOfWork.Repository<HotelProperty>().UpdateAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Property updated successfully.");
    }

    private async Task Validate(CreatePropertyCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<PropertyStatus>( (int)request.Status );
        await Task.CompletedTask;
    }

}
