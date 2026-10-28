using Application.Dto.NightAudits;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.NightAudits;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.NightAudits.Queries;

public class GetAllNightAuditQuery : IRequest<Result<List<GetNightAuditDto>>>
{
}

internal class GetAllNightAuditQueryHandler : IRequestHandler<GetAllNightAuditQuery, Result<List<GetNightAuditDto>>>
{
    private readonly IQueryContext _queryContext;

    public GetAllNightAuditQueryHandler(IQueryContext queryContext)
    {
        _queryContext = queryContext;
    }

    public async Task<Result<List<GetNightAuditDto>>> Handle(GetAllNightAuditQuery request, CancellationToken cancellationToken)
    {
        var audits = await _queryContext.Repository<NightAudit>().Entities
            .OrderByDescending(x => x.BusinessDate)
            .ToListAsync(cancellationToken);

        var dtos = audits.Select(x => new GetNightAuditDto
        {
            Id = x.Id,
            BusinessDate = x.BusinessDate.ToString("yyyy-MM-dd"),
            AuditTimestamp = x.AuditTimestamp,
            AuditedBy = x.AuditedBy,
            TotalRooms = x.TotalRooms,
            OccupiedRooms = x.OccupiedRooms,
            OccupancyRate = x.OccupancyRate,
            RoomRevenue = x.RoomRevenue,
            PosRevenue = x.PosRevenue,
            ServicesRevenue = x.ServicesRevenue,
            TotalRevenue = x.TotalRevenue,
            Adr = x.Adr,
            RevPar = x.RevPar,
            TotalGst = x.TotalGst,
            CashSettlement = x.CashSettlement,
            UpiSettlement = x.UpiSettlement,
            CardSettlement = x.CardSettlement,
            CorporateSettlement = x.CorporateSettlement,
            Notes = x.Notes,
            CreatedDate = x.CreatedDate,
            IsActive = x.IsActive
        }).ToList();

        return Result<List<GetNightAuditDto>>.Success(dtos, "Night audits retrieved successfully");
    }
}
