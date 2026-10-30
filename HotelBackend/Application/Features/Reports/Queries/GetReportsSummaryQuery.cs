using Application.Dto.Reports;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Expenses;
using Domain.Entities.ServiceOrders;
using Domain.Common.Enums.Hotels;
using Domain.Entities.NightAudits;
using Domain.Entities.Reservations;
using Domain.Entities.Rooms;
using Domain.Entities.Stays;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Reports.Queries;

public class GetReportsSummaryQuery : IRequest<Result<GetReportsSummaryDto>>
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }

    public GetReportsSummaryQuery(DateTime? from = null, DateTime? to = null)
    {
        From = from;
        To = to;
    }
}

internal class GetReportsSummaryQueryHandler : IRequestHandler<GetReportsSummaryQuery, Result<GetReportsSummaryDto>>
{
    private readonly IQueryContext _queryContext;

    public GetReportsSummaryQueryHandler(IQueryContext queryContext)
    {
        _queryContext = queryContext;
    }

    public async Task<Result<GetReportsSummaryDto>> Handle(GetReportsSummaryQuery request, CancellationToken cancellationToken)
    {
        DateOnly? fromDate = request.From.HasValue ? DateOnly.FromDateTime(request.From.Value) : null;
        DateOnly? toDate = request.To.HasValue ? DateOnly.FromDateTime(request.To.Value) : null;
        bool InRange(DateOnly day) =>
            (fromDate == null || day >= fromDate.Value) && (toDate == null || day <= toDate.Value);

        // Fetch rooms
        var rooms = await _queryContext.Repository<Room>().Entities
            .Include(r => r.RoomType)
            .ToListAsync(cancellationToken);

        var totalRooms = rooms.Count;
        var occupiedRooms = rooms.Count(r => r.Status == RoomStatus.OCCUPIED);
        var availableRooms = rooms.Count(r => r.Status == RoomStatus.AVAILABLE);
        var cleaningRooms = rooms.Count(r => r.Status == RoomStatus.CLEANING);
        var maintenanceRooms = rooms.Count(r => r.Status == RoomStatus.MAINTENANCE);

        // Fetch stays
        var stays = await _queryContext.Repository<Stay>().Entities
            .ToListAsync(cancellationToken);
        var staysInRange = stays
            .Where(s => InRange(DateOnly.FromDateTime(s.CheckOutAt ?? s.CheckInAt)))
            .ToList();

        var activeStays = staysInRange.Count(s => s.Status == StayStatus.ACTIVE);
        var roomRevenue = staysInRange.Sum(s => s.TotalAmount);

        // Fetch expenses
        var expenses = await _queryContext.Repository<HotelExpense>().Entities
            .ToListAsync(cancellationToken);
        var expensesInRange = expenses.Where(e => InRange(e.ExpenseDate)).ToList();

        var totalExpenses = expensesInRange.Sum(e => e.Amount);

        // Fetch reservations
        var reservations = await _queryContext.Repository<Reservation>().Entities
            .ToListAsync(cancellationToken);

        var confirmedReservations = reservations.Count(r => r.Status == ReservationStatus.CONFIRMED && InRange(r.CheckInDate));

        // Fetch night audits for historical trends
        var nightAudits = await _queryContext.Repository<NightAudit>().Entities
            .OrderBy(n => n.BusinessDate)
            .ToListAsync(cancellationToken);
        var auditsInRange = nightAudits.Where(n => InRange(n.BusinessDate)).ToList();

        var serviceOrders = await _queryContext.Repository<ServiceOrder>().Entities
            .ToListAsync(cancellationToken);
        var posRevenue = serviceOrders
            .Where(order => order.Status != ServiceOrderStatus.CANCELLED
                && order.CreatedDate.HasValue
                && InRange(DateOnly.FromDateTime(order.CreatedDate.Value)))
            .Sum(order => order.TotalAmount);
        if (posRevenue == 0)
            posRevenue = auditsInRange.Sum(audit => audit.PosRevenue);

        decimal totalRevenue = roomRevenue + posRevenue;
        decimal netProfit = totalRevenue - totalExpenses;

        decimal occupancyRate = totalRooms > 0 ? Math.Round((decimal)occupiedRooms * 100 / totalRooms, 1) : 0;
        decimal adr = staysInRange.Count > 0 ? Math.Round(roomRevenue / staysInRange.Count, 2) : 0;
        decimal revPar = totalRooms > 0 ? Math.Round(roomRevenue / totalRooms, 2) : 0;

        var kpis = new ReportKpiDto
        {
            TotalRevenue = totalRevenue,
            RoomRevenue = roomRevenue,
            PosRevenue = posRevenue,
            TotalExpenses = totalExpenses,
            NetProfit = netProfit,
            OccupancyRate = occupancyRate,
            RevPar = revPar,
            Adr = adr,
            TotalRooms = totalRooms,
            OccupiedRooms = occupiedRooms,
            AvailableRooms = availableRooms,
            CleaningRooms = cleaningRooms,
            MaintenanceRooms = maintenanceRooms,
            ActiveStays = activeStays,
            ConfirmedReservations = confirmedReservations
        };

        // Revenue trend - build from night audits or last 7 days
        var revenueTrend = new List<DailyRevenuePointDto>();
        var trendAudits = (fromDate == null && toDate == null ? nightAudits.TakeLast(7) : auditsInRange).ToList();
        if (trendAudits.Count > 0)
        {
            foreach (var audit in trendAudits)
            {
                revenueTrend.Add(new DailyRevenuePointDto
                {
                    Date = audit.BusinessDate.ToString("yyyy-MM-dd"),
                    RoomRevenue = audit.RoomRevenue,
                    PosRevenue = audit.PosRevenue,
                    TotalRevenue = audit.TotalRevenue,
                    Occupancy = audit.OccupancyRate
                });
            }
        }

        // Room Performance
        var roomPerformance = rooms.Select(r =>
        {
            var roomStays = staysInRange.Where(s => s.RoomId == r.Id || s.RoomNumber == r.Number).ToList();
            var rev = roomStays.Sum(s => s.TotalAmount);
            return new RoomPerformanceDto
            {
                RoomNumber = r.Number,
                Category = r.Category.ToString(),
                StaysCount = roomStays.Count,
                OccupancyPercent = r.Status == RoomStatus.OCCUPIED ? 100 : 0,
                Revenue = rev
            };
        }).OrderByDescending(rp => rp.Revenue).Take(10).ToList();

        // Revenue by Category
        var catRev = new List<CategoryRevenueDto>();
        decimal roomShare = totalRevenue > 0 ? Math.Round(roomRevenue * 100 / totalRevenue, 1) : 0;
        decimal posShare = totalRevenue > 0 ? Math.Round(posRevenue * 100 / totalRevenue, 1) : 0;

        catRev.Add(new CategoryRevenueDto { Category = "Room Charges", Amount = roomRevenue, Percentage = roomShare });
        catRev.Add(new CategoryRevenueDto { Category = "Restaurant & POS", Amount = posRevenue, Percentage = posShare });

        var dto = new GetReportsSummaryDto
        {
            Kpis = kpis,
            RevenueTrend = revenueTrend,
            RoomPerformance = roomPerformance,
            RevenueByCategory = catRev
        };

        return Result<GetReportsSummaryDto>.Success(dto, "Reports summary retrieved successfully");
    }
}
