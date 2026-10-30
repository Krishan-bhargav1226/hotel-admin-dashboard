using Application.Dto.HotelSettings;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.HotelSettings;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.HotelSettings.Commands;

public class UpdateHotelSettingCommand : IRequest<Result<GetHotelSettingDto>>
{
    [Required]
    [StringLength(150)]
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
    public decimal TaxPercent { get; set; } = 12;
    public decimal CgstPercent { get; set; } = 6;
    public decimal SgstPercent { get; set; } = 6;
    public string? SacCodeAccommodation { get; set; }
    public string? SacCodeFood { get; set; }
    public string? InvoicePrefix { get; set; }
    public string? BankName { get; set; }
    public string? BankAccountNo { get; set; }
    public string? BankIfsc { get; set; }
    public string? FolioPolicy { get; set; }
    public bool AutoCleaning { get; set; } = true;
    public string? CurrencySymbol { get; set; }
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public string? ManagerSignatory { get; set; }
    public string? LogoUrl { get; set; }
    public bool EnableNightAudit { get; set; } = true;
    public bool EnableLostAndFound { get; set; } = true;
}

internal class UpdateHotelSettingCommandHandler : IRequestHandler<UpdateHotelSettingCommand, Result<GetHotelSettingDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public UpdateHotelSettingCommandHandler(
        IUnitOfWork unitOfWork,
        IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<GetHotelSettingDto>> Handle(UpdateHotelSettingCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        var orgId = userOrg.OrganizationId ?? 1;

        var setting = await _unitOfWork.Repository<HotelSetting>().Entities
            .FirstOrDefaultAsync(cancellationToken);

        if (setting == null)
        {
            setting = new HotelSetting
            {
                OrganizationId = orgId
            };
            await _unitOfWork.Repository<HotelSetting>().AddAsync(setting);
        }

        setting.HotelName = request.HotelName;
        setting.ChainName = request.ChainName;
        setting.BrandTier = request.BrandTier;
        setting.Tagline = request.Tagline;
        setting.Address = request.Address;
        setting.City = request.City;
        setting.StateCode = request.StateCode;
        setting.Phone = request.Phone;
        setting.Email = request.Email;
        setting.Website = request.Website;
        setting.Gstin = request.Gstin;
        setting.Cin = request.Cin;
        setting.Fssai = request.Fssai;
        setting.UpiId = request.UpiId;
        setting.TaxPercent = request.TaxPercent;
        setting.CgstPercent = request.CgstPercent;
        setting.SgstPercent = request.SgstPercent;
        setting.SacCodeAccommodation = request.SacCodeAccommodation;
        setting.SacCodeFood = request.SacCodeFood;
        setting.InvoicePrefix = request.InvoicePrefix;
        setting.BankName = request.BankName;
        setting.BankAccountNo = request.BankAccountNo;
        setting.BankIfsc = request.BankIfsc;
        setting.FolioPolicy = request.FolioPolicy;
        setting.AutoCleaning = request.AutoCleaning;
        setting.CurrencySymbol = request.CurrencySymbol ?? "₹";
        setting.CheckInTime = request.CheckInTime;
        setting.CheckOutTime = request.CheckOutTime;
        setting.ManagerSignatory = request.ManagerSignatory;
        setting.LogoUrl = request.LogoUrl;
        setting.EnableNightAudit = request.EnableNightAudit;
        setting.EnableLostAndFound = request.EnableLostAndFound;
        setting.UpdatedDate = DateTime.UtcNow;

        await _unitOfWork.Repository<HotelSetting>().UpdateAsync(setting);
        await _unitOfWork.Save(cancellationToken);

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
            EnableLostAndFound = setting.EnableLostAndFound
        };

        return Result<GetHotelSettingDto>.Success(dto, "Settings updated successfully.");
    }
}
