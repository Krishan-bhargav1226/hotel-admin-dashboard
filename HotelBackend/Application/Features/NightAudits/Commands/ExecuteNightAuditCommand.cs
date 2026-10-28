using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.NightAudits;
using MediatR;
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

        var audit = new NightAudit
        {
            BusinessDate = date,
            AuditTimestamp = DateTime.UtcNow,
            AuditedBy = string.IsNullOrWhiteSpace(request.AuditedBy) ? "audit-bot" : request.AuditedBy,
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
            CashSettlement = request.Settlements.Cash,
            UpiSettlement = request.Settlements.Upi,
            CardSettlement = request.Settlements.Card,
            CorporateSettlement = request.Settlements.Corporate,
            Notes = request.Notes,
            OrganizationId = orgId,
            CreatedDate = DateTime.UtcNow,
            IsActive = true
        };

        await _unitOfWork.Repository<NightAudit>().AddAsync(audit);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success(audit.Id, "Night audit executed and closed successfully");
    }
}
