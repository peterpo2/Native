using System;
using System.Security.Claims;

namespace Native.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var identifier = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (identifier is null || !Guid.TryParse(identifier, out var userId))
        {
            throw new InvalidOperationException("User identifier missing from token");
        }

        return userId;
    }

    public static bool IsAdmin(this ClaimsPrincipal principal)
        => principal.IsInRole("Admin");
}
