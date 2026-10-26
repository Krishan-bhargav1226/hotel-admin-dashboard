using Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.HotelSettings;

public class HotelSetting : BaseAuditableEntity
{
    [Required]
    [StringLength(150)]
    public string HotelName { get; set; } = string.Empty;

    [StringLength(150)]
    public string? ChainName { get; set; }

    [StringLength(50)]
    public string? BrandTier { get; set; }

    [StringLength(200)]
    public string? Tagline { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(20)]
    public string? StateCode { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(150)]
    public string? Email { get; set; }

    [StringLength(150)]
    public string? Website { get; set; }

    [StringLength(20)]
    public string? Gstin { get; set; }

    [StringLength(30)]
    public string? Cin { get; set; }

    [StringLength(20)]
    public string? Fssai { get; set; }

    [StringLength(100)]
    public string? UpiId { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal CgstPercent { get; set; }
    public decimal SgstPercent { get; set; }

    [StringLength(20)]
    public string? SacCodeAccommodation { get; set; }

    [StringLength(20)]
    public string? SacCodeFood { get; set; }

    [StringLength(20)]
    public string? InvoicePrefix { get; set; }

    [StringLength(100)]
    public string? BankName { get; set; }

    [StringLength(40)]
    public string? BankAccountNo { get; set; }

    [StringLength(20)]
    public string? BankIfsc { get; set; }

    [StringLength(500)]
    public string? FolioPolicy { get; set; }
    public bool AutoCleaning { get; set; } = true;

    [StringLength(10)]
    public string? CurrencySymbol { get; set; }

    [StringLength(10)]
    public string? CheckInTime { get; set; }

    [StringLength(10)]
    public string? CheckOutTime { get; set; }

    [StringLength(100)]
    public string? ManagerSignatory { get; set; }
    public string? LogoUrl { get; set; }
    public bool EnableNightAudit { get; set; } = true;
    public bool EnableLostAndFound { get; set; } = true;
}
