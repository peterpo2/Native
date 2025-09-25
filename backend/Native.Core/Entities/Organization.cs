namespace Native.Core.Entities;

public class Organization
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public ICollection<User> Users { get; set; } = new List<User>();
}
