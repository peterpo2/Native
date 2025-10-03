using System;
using Microsoft.AspNetCore.Identity;
using Native.Core.Interfaces;

namespace Native.Core.Entities;

public class User : IdentityUser<Guid>, ISoftDeletable
{
    public string FullName { get; set; } = default!;
    public string Role { get; set; } = "User";
    public Guid? OrganizationId { get; set; }
    public bool IsTwoFactorEnabled { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
}
