using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using PradeepSweetShop.Api.Helpers;
using PradeepSweetShop.Api.Data;
using System.Security.Claims;

namespace PradeepSweetShop.Api.Hubs;

public class OrderHub(TrackingTokens tokens, ApplicationDbContext database, AdminTokens adminTokens) : Hub
{
    // Group for admins who need to receive all new order notifications
    [Authorize(Roles = "Admin")]
    public async Task JoinAdminDashboard()
    {
        var id = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        var version = Context.User?.FindFirstValue("password_version");
        if (!int.TryParse(id, out var userId)) throw new HubException("Invalid admin session.");
        var user = await database.AdminUsers.FindAsync(userId);
        if (user?.Role != "Admin" || version != adminTokens.Version(user.PasswordHash))
            throw new HubException("Admin session expired. Sign in again.");
        await Groups.AddToGroupAsync(Context.ConnectionId, AdminTokens.Group(id!, version!));
    }

    [Authorize(Roles = "Admin")]
    public async Task LeaveAdminDashboard()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, AdminTokens.Group(
            Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!, Context.User!.FindFirstValue("password_version")!));
    }

    // Group for customers tracking a specific order
    public async Task JoinOrderTracker(string orderNumber, string trackingToken)
    {
        if (!tokens.Validate(orderNumber, trackingToken))
            throw new HubException("A valid private tracking code is required.");
        await Groups.AddToGroupAsync(Context.ConnectionId, orderNumber);
    }

    public async Task LeaveOrderTracker(string orderNumber)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, orderNumber);
    }
}
