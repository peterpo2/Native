using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Native.Api.Hubs;

[Authorize]
public class TaskHub : Hub
{
}
