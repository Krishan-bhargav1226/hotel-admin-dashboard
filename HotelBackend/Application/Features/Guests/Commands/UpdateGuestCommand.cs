using Application.Common.Helpers;
using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Guests;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Guests.Commands;

public class UpdateGuestCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreateGuestCommand CreateCommand { get; set; }

    public UpdateGuestCommand(int id, CreateGuestCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdateGuestCommandHandler : IRequestHandler<UpdateGuestCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;
    private readonly ICreateDocumentPath _createDocumentPath;

    public UpdateGuestCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository, ICreateDocumentPath createDocumentPath)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<string>> Handle(UpdateGuestCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        request.CreateCommand.Phone = PhoneNormalizer.Normalize(request.CreateCommand.Phone);
        if (!ValidationManager.IsValidPhoneNumber(request.CreateCommand.Phone))
            return Result<string>.BadRequest("Phone number must be 10 digits.");

        await Validate(request.CreateCommand, cancellationToken);

        var duplicate = await _unitOfWork.Repository<Guest>().Entities
            .AnyAsync(x => x.Id != request.Id && x.Phone.ToLower() == request.CreateCommand.Phone.ToLower(), cancellationToken);
        if (duplicate)
            return Result<string>.BadRequest($"Guest already exists.");

        var entity = await _unitOfWork.Repository<Guest>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("Guest does not exist.");

        _mapper.Map(request.CreateCommand, entity);

        if (request.CreateCommand.IdImageFile != null)
        {
            if (!string.IsNullOrWhiteSpace(entity.IdImage))
                _createDocumentPath.DeleteDocument(entity.IdImage);
            entity.IdImage = await _createDocumentPath.Create(request.CreateCommand.IdImageFile);
        }

        await _unitOfWork.Repository<Guest>().UpdateAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Guest updated successfully.");
    }

    private async Task Validate(CreateGuestCommand request, CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
    }

}
