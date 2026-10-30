using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.NightAudits;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.NightAudits.Commands;

public class NightAuditSettlementDto
{
    public decimal Cash { get; set; }
    public decimal Upi { get; set; }
    public decimal Card { get; set; }
    public decimal Corporate { get; set; }
}

public class ExecuteNightAuditCommand : IRequest<Result<int>>
{
    public string BusinessDate { get; set; } = string.Empty;
    public string AuditedBy { get; set; } = string.Empty;
    public int TotalRooms { get; set; }
    public int OccupiedRooms { get; set; }
    public decimal OccupancyRate { get; set; }
    public decimal RoomRevenue { get; set; }
    public decimal PosRevenue { get; set; }
    public decimal ServicesRevenue { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal Adr { get; set; }
    public decimal RevPar { get; set; }
    public decimal TotalGst { get; set; }
    public NightAuditSettlementDto Settlements { get; set; } = new();
    public string? Notes { get; set; }
}

internal class ExecuteNightAuditCommandHandler : IRequestHandler<ExecuteNightAuditCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _userOrgRepo;

    public ExecuteNightAuditCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository userOrgRepo)
    {
        _unitOfWork = unitOfWork;
        _userOrgRepo = userOrgRepo;
    }

    public async Task<Result<int>> Handle(ExecuteNightAuditCommand request, CancellationToken cancellationToken)
    {
        if (!DateOnly.TryParse(request.BusinessDate, out var date))
            date = DateOnly.FromDateTime(DateTime.UtcNow);

        int orgId = 1;
        try
        {
            var userOrg = await _userOrgRepo.Get();
            if (userOrg != null && userOrg.OrganizationId.HasValue && userOrg.OrganizationId.Value != 0)
                orgId = userOrg.OrganizationId.Value;
        }
        catch
        {
            orgId = 1;
        }

        var settlements = request.Settlements ?? new NightAuditSettlementDto();
        var auditedBy = string.IsNullOrWhiteSpace(request.AuditedBy) ? "audit-bot" : request.AuditedBy.Trim();
        if (auditedBy.Length > 150)
            auditedBy = auditedBy[..150];
        var notes = request.Notes?.Trim();
        if (notes != null && notes.Length > 1000)
            notes = notes[..1000];

        var existing = await _unitOfWork.Repository<NightAudit>().Entities
            .FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.BusinessDate == date, cancellationToken);

        if (existing != null)
        {
            existing.AuditTimestamp = DateTime.UtcNow;
            existing.AuditedBy = auditedBy;
            existing.TotalRooms = request.TotalRooms;
            existing.OccupiedRooms = request.OccupiedRooms;
            existing.OccupancyRate = request.OccupancyRate;
            existing.RoomRevenue = request.RoomRevenue;
            existing.PosRevenue = request.PosRevenue;
            existing.ServicesRevenue = request.ServicesRevenue;
            existing.TotalRevenue = request.TotalRevenue;
            existing.Adr = request.Adr;
            existing.RevPar = request.RevPar;
            existing.TotalGst = request.TotalGst;
            existing.CashSettlement = settlements.Cash;
            existing.UpiSettlement = settlements.Upi;
            existing.CardSettlement = settlements.Card;
            existing.CorporateSettlement = settlements.Corporate;
            existing.Notes = notes;
            await _unitOfWork.Repository<NightAudit>().UpdateAsync(existing);
            await _unitOfWork.Save(cancellationToken);
            return Result<int>.Success(existing.Id, "Night audit executed and closed successfully");
        }

        var audit = new NightAudit
        {
            BusinessDate = date,
            AuditTimestamp = DateTime.UtcNow,
            AuditedBy = auditedBy,
            TotalRooms = request.TotalRooms,
            OccupiedRooms = request.OccupiedRooms,
            OccupancyRate = request.OccupancyRate,
            RoomRevenue = request.RoomRevenue,
            PosRevenue = request.PosRevenue,
            ServicesRevenue = request.ServicesRevenue,
            TotalRevenue = request.TotalRevenue,
            Adr = request.Adr,
            RevPar = request.RevPar,
            TotalGst = request.TotalGst,
            CashSettlement = settlements.Cash,
            UpiSettlement = settlements.Upi,
            CardSettlement = settlements.Card,
            CorporateSettlement = settlements.Corporate,
            Notes = notes,
            OrganizationId = orgId,
            CreatedDate = DateTime.UtcNow,
            IsActive = true
        };

        await _unitOfWork.Repository<NightAudit>().AddAsync(audit);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success(audit.Id, "Night audit executed and closed successfully");
    }
}
