using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Hotels;
using Domain.Entities.HotelSettings;
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

        var previousName = entity.Name;
        _mapper.Map(request.CreateCommand, entity);

        await _unitOfWork.Repository<HotelProperty>().UpdateAsync(entity);
        await SyncDeskSettingsAsync(entity, previousName, userOrg.OrganizationId, cancellationToken);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Property updated successfully.");
    }

    private async Task SyncDeskSettingsAsync(HotelProperty property, string? previousName, int? organizationId, CancellationToken cancellationToken)
    {
        var setting = await _unitOfWork.Repository<HotelSetting>().Entities
            .FirstOrDefaultAsync(cancellationToken);
        var propertyCount = await _unitOfWork.Repository<HotelProperty>().Entities.CountAsync(cancellationToken);
        var sameHotel = setting != null && (
            string.Equals(setting.HotelName, previousName, StringComparison.OrdinalIgnoreCase)
            || string.Equals(setting.HotelName, property.Name, StringComparison.OrdinalIgnoreCase));
        if (setting != null && propertyCount > 1 && !sameHotel)
            return;

        var isNew = setting == null;
        setting ??= new HotelSetting
        {
            OrganizationId = property.OrganizationId > 0 ? property.OrganizationId : organizationId ?? 0,
            CurrencySymbol = "₹",
            TaxPercent = 12,
            CgstPercent = 6,
            SgstPercent = 6,
            AutoCleaning = true,
            EnableNightAudit = true,
            EnableLostAndFound = true
        };

        setting.HotelName = Clip(property.Name, 150) ?? setting.HotelName;
        setting.ChainName = Clip(property.Chain, 150);
        setting.BrandTier = Clip(property.BrandTier, 50);
        setting.Address = Clip(property.Address, 300);
        setting.City = Clip(property.Location, 100);
        setting.Phone = Clip(property.Phone, 20);
        setting.Email = Clip(property.Email, 150);
        setting.Gstin = Clip(property.Gstin, 20);
        setting.UpiId = Clip(property.UpiId, 100);
        setting.ManagerSignatory = Clip(property.ManagerName, 100);
        setting.UpdatedDate = DateTime.UtcNow;
        if (string.IsNullOrWhiteSpace(setting.HotelName))
            return;

        if (isNew)
            await _unitOfWork.Repository<HotelSetting>().AddAsync(setting);
        else
            await _unitOfWork.Repository<HotelSetting>().UpdateAsync(setting);
    }

    private static string? Clip(string? value, int max)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;
        var text = value.Trim();
        return text.Length > max ? text[..max] : text;
    }

    private async Task Validate(CreatePropertyCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<PropertyStatus>( (int)request.Status );
        await Task.CompletedTask;
    }

}
