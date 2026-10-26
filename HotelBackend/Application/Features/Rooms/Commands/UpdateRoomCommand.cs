using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.Properties;
using Domain.Entities.RoomTypes;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Rooms.Commands;

public class UpdateRoomCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreateRoomCommand CreateCommand { get; set; }

    public UpdateRoomCommand(int id, CreateRoomCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;
    private readonly ICreateDocumentPath _createDocumentPath;

    public UpdateRoomCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository, ICreateDocumentPath createDocumentPath)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<string>> Handle(UpdateRoomCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        await Validate(request.CreateCommand, cancellationToken);

        var duplicate = await _unitOfWork.Repository<Room>().Entities
            .AnyAsync(x => x.Id != request.Id && x.Number.ToLower() == request.CreateCommand.Number.ToLower(), cancellationToken);
        if (duplicate)
            return Result<string>.BadRequest($"Room already exists.");

        var entity = await _unitOfWork.Repository<Room>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("Room does not exist.");

        _mapper.Map(request.CreateCommand, entity);

        if (request.CreateCommand.ImageFile != null)
        {
            if (!string.IsNullOrWhiteSpace(entity.Image))
                _createDocumentPath.DeleteDocument(entity.Image);
            entity.Image = await _createDocumentPath.Create(request.CreateCommand.ImageFile);
        }

        await _unitOfWork.Repository<Room>().UpdateAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Room updated successfully.");
    }

    private async Task Validate(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<RoomStatus>( (int)request.Status );
        if ((int)request.Category != 0)
            _validationManager.ValidateEnum<RoomCategory>( (int)request.Category );
        await _validationManager.ValidateId<RoomType>(request.RoomTypeId);
        await _validationManager.ValidateId<HotelProperty>(request.PropertyId);
    }

}
