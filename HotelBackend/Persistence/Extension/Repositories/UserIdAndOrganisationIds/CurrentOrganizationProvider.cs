using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Persistence.Extension.Repositories.UserIdAndOrganizationIds;

public class CurrentOrganizationProvider : ICurrentOrganizationProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;

    public CurrentOrganizationProvider(IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
    {
        _httpContextAccessor = httpContextAccessor;
        _configuration = configuration;
    }

    public List<int> GetOrganizationIds()
    {
        List<int> organizationIds = [];

        int mainOrgId = 0;
        if (_httpContextAccessor.HttpContext?.Request.Headers.TryGetValue("OrganizationId", out var orgId) == true &&
            int.TryParse(orgId, out var parsedId))
        {
            organizationIds.Add(parsedId);
            mainOrgId = parsedId;
        }
        else
        {
            organizationIds.Add(1);
            mainOrgId = 1;
        }

        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        using (var connection = new NpgsqlConnection(connectionString))
        {
            connection.Open();

            string sql = "SELECT \"Id\" FROM \"Organizations\" WHERE \"ParentId\" = @parentId";

            using (var cmd = new NpgsqlCommand(sql, connection))
            {
                cmd.Parameters.AddWithValue("parentId", mainOrgId);

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        if (reader.GetInt32(0) != 0)
                        {
                            organizationIds.Add(reader.GetInt32(0));
                        }
                    }
                }
            }
        }

        return organizationIds;
    }
}
