using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.RoomTypes;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.RoomTypes.Commands;

public class UpdateRoomTypeCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreateRoomTypeCommand CreateCommand { get; set; }

    public UpdateRoomTypeCommand(int id, CreateRoomTypeCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdateRoomTypeCommandHandler : IRequestHandler<UpdateRoomTypeCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;
    private readonly ICreateDocumentPath _createDocumentPath;

    public UpdateRoomTypeCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository, ICreateDocumentPath createDocumentPath)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<string>> Handle(UpdateRoomTypeCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        await Validate(request.CreateCommand, cancellationToken);

        var entity = await _unitOfWork.Repository<RoomType>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("RoomType does not exist.");

        _mapper.Map(request.CreateCommand, entity);

        if (request.CreateCommand.ImageFile != null)
        {
            if (!string.IsNullOrWhiteSpace(entity.Image))
                _createDocumentPath.DeleteDocument(entity.Image);
            entity.Image = await _createDocumentPath.Create(request.CreateCommand.ImageFile);
        }

        await _unitOfWork.Repository<RoomType>().UpdateAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("RoomType updated successfully.");
    }

    private async Task Validate(CreateRoomTypeCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<RoomCategory>( (int)request.Category );
        await Task.CompletedTask;
    }

}
