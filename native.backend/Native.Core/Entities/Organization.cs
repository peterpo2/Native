using System;
using System.Collections.Generic;
using Native.Core.Interfaces;

namespace Native.Core.Entities;

public class Organization : ISoftDeletable
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Domain { get; set; }
    public string? SettingsJson { get; set; }
    public ICollection<User> Users { get; set; } = new List<User>();
    public bool IsDeleted { get; set; }
}
