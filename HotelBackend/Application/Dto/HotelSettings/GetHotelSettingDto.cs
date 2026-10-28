using Application.Dto.CommonDtos;

namespace Application.Dto.HotelSettings;

public class GetHotelSettingDto : BaseDto
{
    public string HotelName { get; set; } = string.Empty;
    public string? ChainName { get; set; }
    public string? BrandTier { get; set; }
    public string? Tagline { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? StateCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Gstin { get; set; }
    public string? Cin { get; set; }
    public string? Fssai { get; set; }
    public string? UpiId { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal CgstPercent { get; set; }
    public decimal SgstPercent { get; set; }
    public string? SacCodeAccommodation { get; set; }
    public string? SacCodeFood { get; set; }
    public string? InvoicePrefix { get; set; }
    public string? BankName { get; set; }
    public string? BankAccountNo { get; set; }
    public string? BankIfsc { get; set; }
    public string? FolioPolicy { get; set; }
    public bool AutoCleaning { get; set; }
    public string? CurrencySymbol { get; set; }
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public string? ManagerSignatory { get; set; }
    public string? LogoUrl { get; set; }
    public bool EnableNightAudit { get; set; }
    public bool EnableLostAndFound { get; set; }
}
