using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Native.Core.Entities;
using Native.Core.Models;

namespace Native.Core.Interfaces;

public interface IAuthService
{
    Task<(bool Succeeded, IEnumerable<string> Errors)> RegisterAsync(User user, string password, CancellationToken cancellationToken = default);
    Task<AuthResult?> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
}
