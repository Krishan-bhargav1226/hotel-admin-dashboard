using System.Net;
using System.Net.Http.Json;

namespace WebApi.Tests;

public class ApiSecurityTests : IClassFixture<HotelApiFactory>
{
    private readonly HttpClient _client;

    public ApiSecurityTests(HotelApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Live_health_is_anonymous()
    {
        var response = await _client.GetAsync("/health/live");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Ready_health_reaches_the_database()
    {
        var response = await _client.GetAsync("/health/ready");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Room_list_requires_authentication()
    {
        var response = await _client.GetAsync("/api/room");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_rejects_an_empty_body()
    {
        var response = await _client.PostAsJsonAsync("/api/user/login", new { });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Admin_password_change_is_not_anonymous()
    {
        var response = await _client.PutAsJsonAsync("/api/user/change-password/admin", new { userId = "missing", newPassword = "long-enough" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
