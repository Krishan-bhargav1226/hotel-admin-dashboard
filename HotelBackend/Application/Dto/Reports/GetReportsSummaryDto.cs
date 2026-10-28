namespace Application.Dto.Reports;

public class GetReportsSummaryDto
{
    public ReportKpiDto Kpis { get; set; } = new();
    public List<DailyRevenuePointDto> RevenueTrend { get; set; } = [];
    public List<RoomPerformanceDto> RoomPerformance { get; set; } = [];
    public List<CategoryRevenueDto> RevenueByCategory { get; set; } = [];
}

public class ReportKpiDto
{
    public decimal TotalRevenue { get; set; }
    public decimal RoomRevenue { get; set; }
    public decimal PosRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public decimal OccupancyRate { get; set; }
    public decimal RevPar { get; set; }
    public decimal Adr { get; set; }
    public int TotalRooms { get; set; }
    public int OccupiedRooms { get; set; }
    public int AvailableRooms { get; set; }
    public int CleaningRooms { get; set; }
    public int MaintenanceRooms { get; set; }
    public int ActiveStays { get; set; }
    public int ConfirmedReservations { get; set; }
}

public class DailyRevenuePointDto
{
    public string Date { get; set; } = string.Empty;
    public decimal RoomRevenue { get; set; }
    public decimal PosRevenue { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal Occupancy { get; set; }
}

public class RoomPerformanceDto
{
    public string RoomNumber { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int StaysCount { get; set; }
    public decimal OccupancyPercent { get; set; }
    public decimal Revenue { get; set; }
}

public class CategoryRevenueDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Percentage { get; set; }
}
