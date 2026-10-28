using Application.Dto.HotelSettings;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.HotelSettings;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.HotelSettings.Queries;

public record GetHotelSettingQuery : IRequest<Result<GetHotelSettingDto>>;

internal class GetHotelSettingQueryHandler : IRequestHandler<GetHotelSettingQuery, Result<GetHotelSettingDto>>
{
    private readonly IQueryContext _queryContext;

    public GetHotelSettingQueryHandler(IQueryContext queryContext)
    {
        _queryContext = queryContext;
    }

    public async Task<Result<GetHotelSettingDto>> Handle(GetHotelSettingQuery request, CancellationToken cancellationToken)
    {
        var setting = await _queryContext.Repository<HotelSetting>().Entities
            .FirstOrDefaultAsync(cancellationToken);

        if (setting == null)
        {
            var fallback = new GetHotelSettingDto
            {
                HotelName = "Grand Horizon Palace & Spa",
                ChainName = "Grand Horizon Hotels & Resorts",
                BrandTier = "★★★★★ Signature Luxury Heritage",
                Tagline = "Timeless Elegance & Royal Hospitality",
                Address = "Amer Road, Civil Lines, Jaipur, Rajasthan 302006",
                City = "Jaipur",
                StateCode = "08 - Rajasthan",
                Phone = "0141-4567890",
                Email = "jaipur@grandhorizon.local",
                Website = "https://grandhorizonhotels.com",
                Gstin = "08AABCG1234P1Z5",
                Cin = "U55101RJ2018PLC048291",
                Fssai = "10019011000543",
                UpiId = "grandhorizon.jaipur@okaxis",
                TaxPercent = 12,
                CgstPercent = 6,
                SgstPercent = 6,
                SacCodeAccommodation = "996311",
                SacCodeFood = "996331",
                InvoicePrefix = "GH-JAI/2026/",
                BankName = "HDFC Bank Ltd",
                BankAccountNo = "50200084920194",
                BankIfsc = "HDFC0001234",
                FolioPolicy = "Government issued photo ID is mandatory at check-in. Check-out time is strictly 11:00 AM. Free cancellation up to 24 hrs prior to arrival. Management reserves the right of admission.",
                AutoCleaning = true,
                CurrencySymbol = "₹",
                CheckInTime = "12:00 PM",
                CheckOutTime = "11:00 AM",
                ManagerSignatory = "Vikram Malhotra (General Manager)",
                EnableNightAudit = true,
                EnableLostAndFound = true
            };
            return Result<GetHotelSettingDto>.Success(fallback, "Default hotel settings retrieved.");
        }

        var dto = new GetHotelSettingDto
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

        return Result<GetHotelSettingDto>.Success(dto, "Hotel settings retrieved successfully.");
    }
}
