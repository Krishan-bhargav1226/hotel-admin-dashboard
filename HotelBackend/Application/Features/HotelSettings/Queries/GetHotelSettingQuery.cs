using Application.Dto.HotelSettings;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.HotelSettings;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.HotelSettings.Queries;

public record GetHotelSettingQuery : IRequest<Result<GetHotelSettingDto>>;

internal class GetHotelSettingQueryHandler : IRequestHandler<GetHotelSettingQuery, Result<GetHotelSettingDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IUserIdAndOrganizationIdRepository _caller;

    public GetHotelSettingQueryHandler(IQueryContext queryContext, IUserIdAndOrganizationIdRepository caller)
    {
        _queryContext = queryContext;
        _caller = caller;
    }

    public async Task<Result<GetHotelSettingDto>> Handle(GetHotelSettingQuery request, CancellationToken cancellationToken)
    {
        var setting = await _queryContext.Repository<HotelSetting>().Entities
            .FirstOrDefaultAsync(cancellationToken);
        var caller = await _caller.Get();
        HotelProperty? property = null;
        if (caller.PropertyId is int propertyId)
        {
            property = await _queryContext.Repository<HotelProperty>().Entities
                .FirstOrDefaultAsync(item => item.Id == propertyId, cancellationToken);
        }

        var dto = setting == null ? BlankSettings() : Map(setting);
        if (property != null)
            ApplyProperty(dto, property);

        return Result<GetHotelSettingDto>.Success(dto, setting == null
            ? "Hotel settings retrieved."
            : "Hotel settings retrieved successfully.");
    }

    private static GetHotelSettingDto BlankSettings() => new()
    {
        TaxPercent = 12,
        CgstPercent = 6,
        SgstPercent = 6,
        AutoCleaning = true,
        CurrencySymbol = "₹",
        EnableNightAudit = true,
        EnableLostAndFound = true
    };

    private static GetHotelSettingDto Map(HotelSetting setting) => new()
    {
        Id = setting.Id,
        HotelName = setting.HotelName,
        ChainName = setting.ChainName,
        BrandTier = setting.BrandTier,
        Tagline = setting.Tagline,
        Address = setting.Address,
        City = setting.City,
        StateCode = setting.StateCode,
        Phone = setting.Phone,
        Email = setting.Email,
        Website = setting.Website,
        Gstin = setting.Gstin,
        Cin = setting.Cin,
        Fssai = setting.Fssai,
        UpiId = setting.UpiId,
        TaxPercent = setting.TaxPercent,
        CgstPercent = setting.CgstPercent,
        SgstPercent = setting.SgstPercent,
        SacCodeAccommodation = setting.SacCodeAccommodation,
        SacCodeFood = setting.SacCodeFood,
        InvoicePrefix = setting.InvoicePrefix,
        BankName = setting.BankName,
        BankAccountNo = setting.BankAccountNo,
        BankIfsc = setting.BankIfsc,
        FolioPolicy = setting.FolioPolicy,
        AutoCleaning = setting.AutoCleaning,
        CurrencySymbol = setting.CurrencySymbol,
        CheckInTime = setting.CheckInTime,
        CheckOutTime = setting.CheckOutTime,
        ManagerSignatory = setting.ManagerSignatory,
        LogoUrl = setting.LogoUrl,
        EnableNightAudit = setting.EnableNightAudit,
        EnableLostAndFound = setting.EnableLostAndFound,
        CreatedDate = setting.CreatedDate,
        UpdatedDate = setting.UpdatedDate
    };

    internal static void ApplyProperty(GetHotelSettingDto dto, HotelProperty property)
    {
        dto.HotelName = Text(property.Name, 150) ?? dto.HotelName;
        dto.ChainName = Text(property.Chain, 150) ?? dto.ChainName;
        dto.BrandTier = Text(property.BrandTier, 50) ?? dto.BrandTier;
        dto.Address = Text(property.Address, 300) ?? dto.Address;
        dto.City = Text(property.Location, 100) ?? dto.City;
        dto.Phone = Text(property.Phone, 20) ?? dto.Phone;
        dto.Email = Text(property.Email, 150) ?? dto.Email;
        dto.Gstin = Text(property.Gstin, 20) ?? dto.Gstin;
        dto.UpiId = Text(property.UpiId, 100) ?? dto.UpiId;
        dto.ManagerSignatory = Text(property.ManagerName, 100) ?? dto.ManagerSignatory;
    }

    private static string? Text(string? value, int max)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;
        var text = value.Trim();
        return text.Length > max ? text[..max] : text;
    }
}
