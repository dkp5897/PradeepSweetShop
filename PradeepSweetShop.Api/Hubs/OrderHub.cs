using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace PradeepSweetShop.Api.Hubs;

public class OrderHub : Hub
{
    // Group for admins who need to receive all new order notifications
    public async Task JoinAdminDashboard()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
    }

    public async Task LeaveAdminDashboard()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
    }

    // Group for customers tracking a specific order
    public async Task JoinOrderTracker(string orderNumber)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, orderNumber);
    }

    public async Task LeaveOrderTracker(string orderNumber)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, orderNumber);
    }
}
