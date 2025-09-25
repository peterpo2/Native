using Native.Core.Entities;

namespace Native.Core.Interfaces;

public interface IAuthService
{
    Task<(bool Succeeded, IEnumerable<string> Errors)> RegisterAsync(User user, string password, CancellationToken cancellationToken = default);
    Task<string?> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
}
