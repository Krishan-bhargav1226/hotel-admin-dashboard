using Microsoft.AspNetCore.SignalR;

namespace Application.Interfaces.Services;

public class ActivityHub : Hub
{
    public string GetConnectionId()
    {
        return Context.ConnectionId;
    }
}
