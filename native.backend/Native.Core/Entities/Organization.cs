using System;
using System.Collections.Generic;

namespace Native.Core.Entities;

public class Organization
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Domain { get; set; }
    public string? SettingsJson { get; set; }
    public ICollection<User> Users { get; set; } = new List<User>();
}
