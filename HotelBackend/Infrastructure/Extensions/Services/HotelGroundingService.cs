using Application.Interfaces.GenericRepositories;
using Application.Interfaces.Services;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Hotels;
using Domain.Entities.HotelSettings;
using Domain.Entities.Housekeepings;
using Domain.Entities.Maintenances;
using Domain.Entities.NightAudits;
using Domain.Entities.Properties;
using Domain.Entities.Reservations;
using Domain.Entities.Rooms;
using Domain.Entities.Stays;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.RegularExpressions;

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
        int? propertyId = null,
        string? propertyName = null,
        string? pageContext = null,
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
            // A. Active Property & Organization Context
            var properties = await _queryContext.Repository<HotelProperty>().Entities
                .Where(p => !p.IsDeleted && (organizationId == null || p.OrganizationId == organizationId))
                .Select(p => new { p.Id, p.Name, p.Location, p.RoomCount, p.OccupancyRate, p.Status })
                .ToListAsync(cancellationToken);

            var activeProp = properties.FirstOrDefault(p => propertyId != null && p.Id == propertyId.Value)
                             ?? properties.FirstOrDefault(p => !string.IsNullOrEmpty(propertyName) && p.Name.Equals(propertyName, StringComparison.OrdinalIgnoreCase))
                             ?? properties.FirstOrDefault();

            sb.AppendLine($"- Active Property: {activeProp?.Name ?? propertyName ?? "Main Hotel"} (ID: {activeProp?.Id ?? propertyId ?? 1})");
            if (properties.Count > 1)
            {
                sb.AppendLine($"- Chain Properties: {string.Join(", ", properties.Select(p => $"{p.Name} (ID: {p.Id}, {p.RoomCount} rooms, {p.OccupancyRate}% occ)"))}");
            }

            // B. Page Context
            if (!string.IsNullOrWhiteSpace(pageContext))
            {
                var pageDesc = pageContext.ToLower() switch
                {
                    var p when p.Contains("room") => "Room Inventory & Photo Gallery (/rooms)",
                    var p when p.Contains("housekeep") => "Housekeeping Board & Turnover Operations (/housekeeping)",
                    var p when p.Contains("check-in") || p.Contains("checkin") => "New Guest Check-In Wizard (/check-in)",
                    var p when p.Contains("stay") => "In-House Active Stays (/stays)",
                    var p when p.Contains("reservation") => "Reservations & Booking Calendar (/reservations)",
                    var p when p.Contains("pos") => "POS & Room Service Orders (/pos)",
                    var p when p.Contains("guest") => "Guests CRM Directory (/guests)",
                    var p when p.Contains("setting") => "Hotel Brand & System Settings (/settings)",
                    var p when p.Contains("dashboard") => "Executive Front Desk Dashboard (/dashboard)",
                    _ => pageContext
                };
                sb.AppendLine($"- User Active Screen: Currently viewing {pageDesc}");
            }

            // C. Hotel Settings
            var settings = await _queryContext.Repository<HotelSetting>().Entities
                .Where(s => !s.IsDeleted && (organizationId == null || s.OrganizationId == organizationId))
                .FirstOrDefaultAsync(cancellationToken);

            if (settings != null)
            {
                sb.AppendLine($"- Operational Rules: Hotel Name: '{settings.HotelName}', Check-in Time: {settings.CheckInTime ?? "12:00 PM"}, Check-out Time: {settings.CheckOutTime ?? "11:00 AM"}, Currency: {settings.CurrencySymbol ?? "₹"}, Tax Rate: {settings.TaxPercent}%");
            }

            // D. Comprehensive Room Inventory
            var roomsQuery = _queryContext.Repository<Room>().Entities
                .Include(r => r.RoomType)
                .Include(r => r.Property)
                .Where(r => !r.IsDeleted && (organizationId == null || r.OrganizationId == organizationId));

            if (propertyId != null && propertyId > 0)
            {
                // Prioritize active property rooms, fallback to all if none
                var propRoomsCount = await roomsQuery.CountAsync(r => r.PropertyId == propertyId, cancellationToken);
                if (propRoomsCount > 0)
                {
                    roomsQuery = roomsQuery.Where(r => r.PropertyId == propertyId);
                }
            }

            var allRooms = await roomsQuery
                .OrderBy(r => r.Number)
                .Select(r => new
                {
                    r.Id,
                    r.Number,
                    r.Floor,
                    r.Status,
                    r.BedType,
                    r.BasePrice,
                    r.Category,
                    r.MaxGuests,
                    r.Notes,
                    RoomTypeName = r.RoomType != null ? r.RoomType.Name : "Standard",
                    PropertyName = r.Property != null ? r.Property.Name : "Default Hotel"
                })
                .ToListAsync(cancellationToken);

            var totalRooms = allRooms.Count;
            var availableRooms = allRooms.Where(r => r.Status == RoomStatus.AVAILABLE).ToList();
            var cleaningRooms = allRooms.Where(r => r.Status == RoomStatus.CLEANING).ToList();
            var occupiedRooms = allRooms.Where(r => r.Status == RoomStatus.OCCUPIED).ToList();
            var maintenanceRooms = allRooms.Where(r => r.Status == RoomStatus.MAINTENANCE).ToList();

            sb.AppendLine($"- Room Inventory Breakdown: Total={totalRooms}, Available={availableRooms.Count}, Cleaning={cleaningRooms.Count}, Occupied={occupiedRooms.Count}, OutOfOrder/Maintenance={maintenanceRooms.Count}");

            // List all rooms explicitly so AI knows each room number and status
            if (allRooms.Count > 0)
            {
                sb.AppendLine("- All Hotel Rooms List:");
                foreach (var rm in allRooms)
                {
                    sb.AppendLine($"  * Room {rm.Number} (Hotel: {rm.PropertyName}, Floor: {rm.Floor}, Status: {rm.Status}, Type: {rm.RoomTypeName}, Bed: {rm.BedType ?? "Double"}, Price: ₹{rm.BasePrice:N0}, MaxGuests: {rm.MaxGuests})");
                }
            }

            // E. Targeted Specific Room Lookup if Room Number Mentioned in Message
            var roomMatches = Regex.Matches(lowerMsg, @"\b\d{2,4}\b");
            foreach (Match match in roomMatches)
            {
                var num = match.Value;
                var targetRoom = allRooms.FirstOrDefault(r => r.Number == num);
                if (targetRoom != null)
                {
                    sb.AppendLine($"[TARGET ROOM FOCUS: Room {num}]:");
                    sb.AppendLine($"  - Status: {targetRoom.Status}, Floor: {targetRoom.Floor}, Room Type: {targetRoom.RoomTypeName}, Base Price: ₹{targetRoom.BasePrice:N0}");

                    // Check if occupied in stays
                    var stay = await _queryContext.Repository<Stay>().Entities
                        .Where(s => !s.IsDeleted && s.RoomNumber == num && s.Status == StayStatus.ACTIVE)
                        .Select(s => new { s.StayNo, s.GuestName, s.CheckInAt, s.ExpectedCheckOutAt })
                        .FirstOrDefaultAsync(cancellationToken);

                    if (stay != null)
                    {
                        sb.AppendLine($"  - Currently Occupied by Guest: {stay.GuestName} (Stay #{stay.StayNo}, Check-in: {stay.CheckInAt:dd MMM yyyy, hh:mm tt})");
                    }

                    // Check housekeeping task
                    var hkTask = await _queryContext.Repository<HousekeepingTask>().Entities
                        .Where(t => !t.IsDeleted && (t.RoomNumber == num || t.RoomId == targetRoom.Id))
                        .OrderByDescending(t => t.Id)
                        .Select(t => new { t.Status, t.Priority, t.AssignedTo, t.Notes, t.LastCleanedAt })
                        .FirstOrDefaultAsync(cancellationToken);

                    if (hkTask != null)
                    {
                        sb.AppendLine($"  - Housekeeping State: {hkTask.Status}, Priority: {hkTask.Priority}, Assigned: {hkTask.AssignedTo ?? "Unassigned"}, Notes: {hkTask.Notes ?? "None"}");
                    }

                    // Check maintenance ticket
                    var mTicket = await _queryContext.Repository<MaintenanceTicket>().Entities
                        .Where(m => !m.IsDeleted && (m.RoomNumber == num || m.RoomId == targetRoom.Id) && m.Status != MaintenanceStatus.RESOLVED)
                        .Select(m => new { m.TicketNo, m.Title, m.Status, m.Priority })
                        .FirstOrDefaultAsync(cancellationToken);

                    if (mTicket != null)
                    {
                        sb.AppendLine($"  - Maintenance Issue: {mTicket.Title} (Ticket #{mTicket.TicketNo}, Status: {mTicket.Status}, Priority: {mTicket.Priority})");
                    }
                }
            }

            // F. Active Housekeeping Queue
            var tasks = await _queryContext.Repository<HousekeepingTask>().Entities
                .Where(t => !t.IsDeleted && (organizationId == null || t.OrganizationId == organizationId) && t.Status != HousekeepingStatus.CLEAN_INSPECTED)
                .OrderByDescending(t => t.Priority)
                .Select(t => new { t.RoomNumber, t.Status, t.Priority, t.AssignedTo, t.Notes })
                .Take(8)
                .ToListAsync(cancellationToken);

            if (tasks.Count > 0)
            {
                sb.AppendLine($"- Active Housekeeping Queue ({tasks.Count} pending): {string.Join("; ", tasks.Select(t => $"Room {t.RoomNumber} [{t.Status}, Priority: {t.Priority}, Staff: {t.AssignedTo ?? "Unassigned"}]"))}");
            }

            // G. In-House Active Stays & Bookings
            if (isSuperOrAdmin || isFrontDesk)
            {
                var activeStays = await _queryContext.Repository<Stay>().Entities
                    .Where(s => !s.IsDeleted && (organizationId == null || s.OrganizationId == organizationId) && s.Status == StayStatus.ACTIVE)
                    .Select(s => new { s.StayNo, s.RoomNumber, s.GuestName, s.CheckInAt, s.ExpectedCheckOutAt, s.TotalAmount })
                    .Take(8)
                    .ToListAsync(cancellationToken);

                var pendingReservations = await _queryContext.Repository<Reservation>().Entities
                    .Where(r => !r.IsDeleted && (organizationId == null || r.OrganizationId == organizationId) && r.Status == ReservationStatus.CONFIRMED)
                    .Select(r => new { r.BookingNo, r.GuestName, r.RoomNumber, r.CheckInDate, r.CheckOutDate })
                    .Take(5)
                    .ToListAsync(cancellationToken);

                sb.AppendLine($"- In-House Active Stays: {activeStays.Count} checked-in guests. Confirmed Incoming Reservations: {pendingReservations.Count}.");
                if (activeStays.Count > 0)
                {
                    sb.AppendLine($"  * Current In-House Guests: {string.Join("; ", activeStays.Select(s => $"{s.GuestName} in Room {s.RoomNumber} (Stay #{s.StayNo})"))}");
                }
                if (pendingReservations.Count > 0)
                {
                    sb.AppendLine($"  * Incoming Bookings: {string.Join("; ", pendingReservations.Select(p => $"{p.GuestName} -> Room {p.RoomNumber ?? "TBA"} on {p.CheckInDate}"))}");
                }
            }

            // H. Open Maintenance Tickets
            if (isSuperOrAdmin || isMaintenance)
            {
                var tickets = await _queryContext.Repository<MaintenanceTicket>().Entities
                    .Where(t => !t.IsDeleted && (organizationId == null || t.OrganizationId == organizationId) && t.Status != MaintenanceStatus.RESOLVED)
                    .Select(t => new { t.TicketNo, t.RoomNumber, t.Title, t.Status, t.Priority })
                    .Take(6)
                    .ToListAsync(cancellationToken);

                if (tickets.Count > 0)
                {
                    sb.AppendLine($"- Open Maintenance Tickets ({tickets.Count}): {string.Join("; ", tickets.Select(tk => $"Ticket #{tk.TicketNo}: {tk.Title} in Room {tk.RoomNumber} ({tk.Priority})"))}");
                }
            }

            // I. Financial KPIs (STRICTLY ADMIN ONLY)
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
