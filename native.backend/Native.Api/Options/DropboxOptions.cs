namespace Native.Api.Options;

public class DropboxOptions
{
    public string? ClientId { get; set; }
    public string? ClientSecret { get; set; }
    public string? RedirectUri { get; set; }
    public string[] Scopes { get; set; } =
    {
        "files.metadata.read",
        "files.content.write"
    };

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ClientId) && !string.IsNullOrWhiteSpace(RedirectUri);
}
