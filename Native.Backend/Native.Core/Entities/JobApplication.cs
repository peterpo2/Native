namespace Native.Core.Entities;

public class JobApplication
{
    public Guid Id { get; set; }
    public string CandidateName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Stage { get; set; } = "Applied";
}
