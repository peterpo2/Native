using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Native.Api.Hubs;

[Authorize]
public class TaskHub : Hub
{
    public Task JoinProject(Guid projectId)
        => Groups.AddToGroupAsync(Context.ConnectionId, projectId.ToString());

    public Task LeaveProject(Guid projectId)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, projectId.ToString());
}
