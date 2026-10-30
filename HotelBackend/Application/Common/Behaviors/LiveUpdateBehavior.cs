using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Services;
using MediatR;
using System.Collections;
using System.Globalization;

namespace Application.Common.Behaviors;

public sealed class LiveUpdateBehavior<TRequest, TResponse>(
    ILiveUpdateBroadcaster broadcaster,
    IUserIdAndOrganizationIdRepository userOrganizationRepository)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private static readonly Dictionary<string, string> EntityByFeature = new(StringComparer.Ordinal)
    {
        ["Properties"] = "Property",
        ["Rooms"] = "Room",
        ["RatePlans"] = "RatePlan",
        ["HotelSettings"] = "Settings",
        ["Users"] = "User",
        ["Roles"] = "Role",
        ["RoomTypes"] = "RoomType",
        ["HotelStaffs"] = "Staff",
        ["Notifications"] = "Notification",
        ["Stays"] = "Stay",
        ["Reservations"] = "Reservation",
        ["Housekeepings"] = "Housekeeping",
        ["Maintenances"] = "Maintenance",
        ["Guests"] = "Guest",
        ["Shifts"] = "Shift",
        ["Expenses"] = "Expense",
        ["PosItems"] = "PosItem",
        ["ServiceOrders"] = "ServiceOrder",
        ["LostItems"] = "LostItem",
        ["NightAudits"] = "NightAudit"
    };

    private static readonly HashSet<string> PropertyScoped = new(StringComparer.Ordinal)
    {
        "Property", "Room", "Staff", "Stay", "Reservation", "Housekeeping", "Maintenance", "ServiceOrder", "Shift", "Expense", "LostItem"
    };

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var response = await next();
        if (!ShouldBroadcast(response))
            return response;

        try
        {
            var change = await DescribeAsync(request, response!);
            if (change != null)
                await broadcaster.BroadcastAsync(change, cancellationToken);
        }
        catch
        {
            // A live-update failure must not roll back a save that already succeeded.
        }

        return response;
    }

    private async Task<LiveEntityChange?> DescribeAsync(TRequest request, TResponse response)
    {
        var entityType = EntityType();
        if (entityType == null)
            return null;

        var caller = await userOrganizationRepository.Get();
        if (caller.OrganizationId is not int organizationId || organizationId <= 0)
            return null;

        var action = ActionName();
        var entityId = ReadEntityId(request, response);
        var propertyId = ReadPropertyId(request);
        if (entityType == "Property" && int.TryParse(entityId, out var propertyEntityId) && propertyEntityId > 0)
            propertyId = propertyEntityId;
        if (propertyId is null or <= 0 && caller.PropertyId is > 0 && PropertyScoped.Contains(entityType))
            propertyId = caller.PropertyId;

        return new LiveEntityChange(
            entityType,
            entityId,
            action,
            organizationId,
            propertyId is > 0 ? propertyId : null,
            ReadFields(request));
    }

    private static bool ShouldBroadcast(TResponse response)
    {
        var ns = typeof(TRequest).Namespace ?? "";
        if (ns.Contains(".UserLogins", StringComparison.Ordinal))
            return false;
        if (!ns.Contains(".Commands", StringComparison.Ordinal) && !ns.Contains(".Command", StringComparison.Ordinal))
            return false;

        var name = typeof(TRequest).Name;
        if (name.Contains("Password", StringComparison.OrdinalIgnoreCase)
            || name.Contains("Otp", StringComparison.OrdinalIgnoreCase)
            || name.Contains("Login", StringComparison.OrdinalIgnoreCase)
            || name.Contains("Verify", StringComparison.OrdinalIgnoreCase)
            || name.Contains("Forget", StringComparison.OrdinalIgnoreCase)
            || name.Contains("Resend", StringComparison.OrdinalIgnoreCase))
            return false;

        if (!EntityByFeature.ContainsKey(FeatureName(ns) ?? ""))
            return false;

        var succeeded = response?.GetType().GetProperty("Successed")?.GetValue(response);
        return succeeded is true;
    }

    private static string? EntityType()
    {
        var feature = FeatureName(typeof(TRequest).Namespace ?? "");
        return feature != null && EntityByFeature.TryGetValue(feature, out var entity) ? entity : null;
    }

    private static string? FeatureName(string ns)
    {
        var parts = ns.Split('.');
        var index = Array.IndexOf(parts, "Features");
        return index >= 0 && index + 1 < parts.Length ? parts[index + 1] : null;
    }

    private static string ActionName()
    {
        var name = typeof(TRequest).Name;
        if (name.StartsWith("Create", StringComparison.Ordinal) || name.StartsWith("Add", StringComparison.Ordinal) || name.StartsWith("UserRegistration", StringComparison.Ordinal))
            return "created";
        if (name.StartsWith("Delete", StringComparison.Ordinal) || name.StartsWith("Remove", StringComparison.Ordinal))
            return "deleted";
        return "updated";
    }

    private static string? ReadEntityId(object request, object response)
    {
        var id = ReadScalar(request, "Id") ?? ReadScalar(request, "UserId") ?? ReadScalar(request, "RoomId");
        if (!string.IsNullOrWhiteSpace(id))
            return id;

        var data = response.GetType().GetProperty("Data")?.GetValue(response);
        if (data is int number && number > 0)
            return number.ToString(CultureInfo.InvariantCulture);
        if (data is string text && text.Length is > 0 and < 80 && !text.Contains(' '))
            return text;
        if (data != null && data is not string)
        {
            var nested = ReadScalar(data, "Id");
            if (!string.IsNullOrWhiteSpace(nested))
                return nested;
        }

        return null;
    }

    private static int? ReadPropertyId(object request)
    {
        var direct = ReadInt(request, "PropertyId");
        if (direct is > 0)
            return direct;

        var nested = request.GetType().GetProperty("CreateCommand")?.GetValue(request);
        if (nested != null)
        {
            var inner = ReadInt(nested, "PropertyId");
            if (inner is > 0)
                return inner;
        }

        var stayNested = request.GetType().GetProperty("Stay")?.GetValue(request);
        if (stayNested != null)
        {
            var inner = ReadInt(stayNested, "PropertyId");
            if (inner is > 0)
                return inner;
        }

        return null;
    }

    private static Dictionary<string, object?>? ReadFields(object request)
    {
        var fields = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
        Collect(request, fields, depth: 0);
        return fields.Count == 0 ? null : fields;
    }

    private static void Collect(object source, Dictionary<string, object?> fields, int depth)
    {
        if (depth > 1)
            return;

        foreach (var property in source.GetType().GetProperties())
        {
            if (!property.CanRead || property.GetIndexParameters().Length > 0)
                continue;
            if (IsSensitive(property.Name) || property.Name is "ImageFile" or "CreateCommand")
            {
                if (property.Name == "CreateCommand" && property.GetValue(source) is { } nested)
                    Collect(nested, fields, depth + 1);
                continue;
            }

            object? value;
            try
            {
                value = property.GetValue(source);
            }
            catch
            {
                continue;
            }

            if (value == null || value is IEnumerable and not string)
                continue;

            var type = value.GetType();
            if (type.IsEnum)
                value = value.ToString();
            else if (value is string text)
                value = text.Length > 200 ? text[..200] : text;
            else if (type != typeof(bool) && !IsNumber(type))
                continue;

            fields[ToCamel(property.Name)] = value;
        }
    }

    private static bool IsSensitive(string name) =>
        name.Contains("Password", StringComparison.OrdinalIgnoreCase)
        || name.Contains("Otp", StringComparison.OrdinalIgnoreCase)
        || name.Contains("Token", StringComparison.OrdinalIgnoreCase)
        || name.Contains("Secret", StringComparison.OrdinalIgnoreCase);

    private static bool IsNumber(Type type)
    {
        type = Nullable.GetUnderlyingType(type) ?? type;
        return type == typeof(int) || type == typeof(long) || type == typeof(decimal)
            || type == typeof(double) || type == typeof(float) || type == typeof(short);
    }

    private static string? ReadScalar(object source, string name)
    {
        var value = source.GetType().GetProperty(name)?.GetValue(source);
        if (value is int number && number > 0)
            return number.ToString(CultureInfo.InvariantCulture);
        if (value is Guid guid && guid != Guid.Empty)
            return guid.ToString();
        if (value is string text && !string.IsNullOrWhiteSpace(text))
            return text.Trim();
        return null;
    }

    private static int? ReadInt(object source, string name)
    {
        var value = source.GetType().GetProperty(name)?.GetValue(source);
        if (value is int number)
            return number;
        if (value is string text && int.TryParse(text, out var parsed))
            return parsed;
        return null;
    }

    private static string ToCamel(string name) =>
        name.Length == 0 ? name : char.ToLowerInvariant(name[0]) + name[1..];
}
