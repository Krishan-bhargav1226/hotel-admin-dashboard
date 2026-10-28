using Application.Interfaces.GenericRepositories;
using Application.Interfaces.Services;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Hotels;
using Domain.Entities.Housekeepings;
using Domain.Entities.Maintenances;
using Domain.Entities.NightAudits;
using Domain.Entities.Reservations;
using Domain.Entities.Rooms;
using Domain.Entities.Stays;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace Infrastructure.Extensions.Services;

public class HotelGroundingService : IHotelGroundingService
{
    private readonly IQueryContext _queryContext;

    public HotelGroundingService(IQueryContext queryContext)
    {
        _queryContext = queryContext;
    }

    public async Task<string> GetSecureGroundingContextAsync(
        string userRole,
        int? organizationId,
        string userMessage,
        CancellationToken cancellationToken = default)
    {
        var lowerMsg = (userMessage ?? "").ToLower();
        var normalizedRole = (userRole ?? "").Trim();
        var isSuperOrAdmin = normalizedRole.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) ||
                             normalizedRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) ||
                             normalizedRole.Equals("GeneralManager", StringComparison.OrdinalIgnoreCase);

        var isFrontDesk = normalizedRole.Equals("Reception", StringComparison.OrdinalIgnoreCase) ||
                          normalizedRole.Equals("FrontDesk", StringComparison.OrdinalIgnoreCase) ||
                          normalizedRole.Equals("Receptionist", StringComparison.OrdinalIgnoreCase);

        var isHousekeeping = normalizedRole.Equals("Housekeeping", StringComparison.OrdinalIgnoreCase);
        var isMaintenance = normalizedRole.Equals("Maintenance", StringComparison.OrdinalIgnoreCase);

        // 1. HARD SECURITY AUTHORIZATION CHECK: FINANCIAL INTENT (C# RBAC ENFORCEMENT)
        bool financialKeywords = lowerMsg.Contains("revenue") || lowerMsg.Contains("revpar") ||
                                 lowerMsg.Contains("profit") || lowerMsg.Contains("adr") ||
                                 lowerMsg.Contains("income") || lowerMsg.Contains("financial") ||
                                 lowerMsg.Contains("audit") || lowerMsg.Contains("salary") ||
                                 lowerMsg.Contains("payroll") || lowerMsg.Contains("expense");

        if (financialKeywords && !isSuperOrAdmin)
        {
            return $"[AUTHORIZATION VIOLATION]: Access to financial data, revenue, night audits, and payroll is strictly restricted to Hotel Administrators. Your active role '{userRole}' was blocked by backend authorization.";
        }

        // 2. HARD SECURITY AUTHORIZATION CHECK: GUEST PII INTENT (C# RBAC ENFORCEMENT)
        bool piiKeywords = lowerMsg.Contains("credit card") || lowerMsg.Contains("card number") ||
                           lowerMsg.Contains("passport number") || lowerMsg.Contains("aadhaar") ||
                           lowerMsg.Contains("phone number") || lowerMsg.Contains("password");

        if (piiKeywords && (isHousekeeping || isMaintenance))
        {
            return $"[AUTHORIZATION VIOLATION]: Access to guest PII (Aadhaar, Passport, Phone, Cards) is strictly forbidden for role '{userRole}'. Security access denied.";
        }

        var sb = new StringBuilder();
        sb.AppendLine("### REAL-TIME VERIFIED DATABASE DATA:");

        try
        {
            // A. Room Status & Availability
            var roomsQuery = _queryContext.Repository<Room>().Entities
                .Where(r => !r.IsDeleted && (organizationId == null || r.OrganizationId == organizationId));

            var totalRooms = await roomsQuery.CountAsync(cancellationToken);
            var occupied = await roomsQuery.CountAsync(r => r.Status == RoomStatus.OCCUPIED, cancellationToken);
            var available = await roomsQuery.CountAsync(r => r.Status == RoomStatus.AVAILABLE, cancellationToken);
            var dirty = await roomsQuery.CountAsync(r => r.Status == RoomStatus.CLEANING, cancellationToken);
            var maintenanceCount = await roomsQuery.CountAsync(r => r.Status == RoomStatus.MAINTENANCE, cancellationToken);

            sb.AppendLine($"- Room Inventory Overview: Total={totalRooms}, Available={available}, Occupied={occupied}, Cleaning/Turnaround={dirty}, Out-of-Order/Maintenance={maintenanceCount}");

            // Specific room details based on request
            if (lowerMsg.Contains("dirty") || lowerMsg.Contains("clean") || isHousekeeping)
            {
                var dirtyRooms = await roomsQuery
                    .Where(r => r.Status == RoomStatus.CLEANING)
                    .Select(r => new { r.Number, r.Floor, r.Notes })
                    .Take(10)
                    .ToListAsync(cancellationToken);

                if (dirtyRooms.Count > 0)
                {
                    sb.AppendLine($"- Rooms currently cleaning/turnaround: {string.Join(", ", dirtyRooms.Select(d => $"Room {d.Number} (Floor {d.Floor})"))}");
                }
            }

            if (lowerMsg.Contains("available") || lowerMsg.Contains("suite") || lowerMsg.Contains("booking") || isFrontDesk)
            {
                var availList = await roomsQuery
                    .Where(r => r.Status == RoomStatus.AVAILABLE)
                    .Select(r => new { r.Number, r.Floor, r.BedType, r.BasePrice, r.Category })
                    .Take(8)
                    .ToListAsync(cancellationToken);

                if (availList.Count > 0)
                {
                    sb.AppendLine($"- Currently Available Rooms: {string.Join(", ", availList.Select(a => $"Room {a.Number} (Floor {a.Floor}, {a.BedType}, ₹{a.BasePrice:N0})"))}");
                }
            }

            // B. Housekeeping Tasks
            if (isSuperOrAdmin || isHousekeeping)
            {
                var tasks = await _queryContext.Repository<HousekeepingTask>().Entities
                    .Where(t => !t.IsDeleted && (organizationId == null || t.OrganizationId == organizationId) && t.Status != HousekeepingStatus.CLEAN_INSPECTED)
                    .OrderByDescending(t => t.Priority)
                    .Select(t => new { t.RoomNumber, t.Status, t.Priority, t.AssignedTo, t.Notes })
                    .Take(6)
                    .ToListAsync(cancellationToken);

                if (tasks.Count > 0)
                {
                    sb.AppendLine($"- Active Housekeeping Queue: {tasks.Count} tasks in progress/pending. Details: {string.Join("; ", tasks.Select(t => $"Room {t.RoomNumber} ({t.Status}, Priority: {t.Priority})"))}");
                }
            }

            // C. Maintenance Tickets
            if (isSuperOrAdmin || isMaintenance)
            {
                var tickets = await _queryContext.Repository<MaintenanceTicket>().Entities
                    .Where(t => !t.IsDeleted && (organizationId == null || t.OrganizationId == organizationId) && t.Status != MaintenanceStatus.RESOLVED)
                    .Select(t => new { t.RoomNumber, t.Title, t.Status, t.Priority })
                    .Take(5)
                    .ToListAsync(cancellationToken);

                if (tickets.Count > 0)
                {
                    sb.AppendLine($"- Open Maintenance Tickets: {tickets.Count} tickets pending. Details: {string.Join("; ", tickets.Select(tk => $"{tk.Title} in Room {tk.RoomNumber} (Priority: {tk.Priority})"))}");
                }
            }

            // D. Front Desk Stays & Bookings
            if (isSuperOrAdmin || isFrontDesk)
            {
                var activeStays = await _queryContext.Repository<Stay>().Entities
                    .Where(s => !s.IsDeleted && (organizationId == null || s.OrganizationId == organizationId) && s.Status == StayStatus.ACTIVE)
                    .Select(s => new { s.StayNo, s.RoomNumber, s.GuestName, s.CheckInAt, s.ExpectedCheckOutAt })
                    .Take(5)
                    .ToListAsync(cancellationToken);

                var pendingReservations = await _queryContext.Repository<Reservation>().Entities
                    .Where(r => !r.IsDeleted && (organizationId == null || r.OrganizationId == organizationId) && r.Status == ReservationStatus.CONFIRMED)
                    .CountAsync(cancellationToken);

                sb.AppendLine($"- In-House Active Stays: {activeStays.Count} records. Confirmed Incoming Reservations: {pendingReservations}.");
                if (activeStays.Count > 0)
                {
                    sb.AppendLine($"- Current In-House Guests: {string.Join(", ", activeStays.Select(s => $"{s.GuestName} (Room {s.RoomNumber})"))}");
                }
            }

            // E. Financial KPIs (STRICTLY ADMIN ONLY)
            if (isSuperOrAdmin && (financialKeywords || lowerMsg.Contains("kpi") || lowerMsg.Contains("overview") || lowerMsg.Contains("summary") || lowerMsg.Contains("report")))
            {
                var latestAudit = await _queryContext.Repository<NightAudit>().Entities
                    .Where(a => !a.IsDeleted && (organizationId == null || a.OrganizationId == organizationId))
                    .OrderByDescending(a => a.BusinessDate)
                    .FirstOrDefaultAsync(cancellationToken);

                if (latestAudit != null)
                {
                    sb.AppendLine($"- Executive Financial Audit ({latestAudit.BusinessDate:yyyy-MM-dd}): Total Revenue=₹{latestAudit.TotalRevenue:N2}, Room Revenue=₹{latestAudit.RoomRevenue:N2}, POS Revenue=₹{latestAudit.PosRevenue:N2}, Occupancy={latestAudit.OccupancyRate:F1}%, RevPAR=₹{latestAudit.RevPar:N2}, ADR=₹{latestAudit.Adr:N2}");
                }
            }
        }
        catch (Exception ex)
        {
            sb.AppendLine($"(Grounding query note: {ex.Message})");
        }

        return sb.ToString();
    }
}
