using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Native.Core.Entities;
using Native.Infrastructure.Data;

namespace Native.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static async Task InitializeDatabaseAsync(this IHost host, CancellationToken cancellationToken = default)
    {
        using var scope = host.Services.CreateScope();
        var services = scope.ServiceProvider;

        var context = services.GetRequiredService<NativeDbContext>();
        if (context.Database.IsRelational())
        {
            var migrations = context.Database.GetMigrations();
            if (migrations.Any())
            {
                await context.Database.MigrateAsync(cancellationToken);
            }
            else
            {
                await context.Database.EnsureCreatedAsync(cancellationToken);
            }
        }
        else
        {
            await context.Database.EnsureCreatedAsync(cancellationToken);
        }

        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var defaultRoles = new[] { "Admin", "Manager", "User", "Client" };
        foreach (var role in defaultRoles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }

        var userManager = services.GetRequiredService<UserManager<User>>();
        var seededUsers = new (string Email, string FullName, string Role, string Password)[]
        {
            ("admin@native.local", "Native Admin", "Admin", "Native!123"),
            ("manager@native.local", "Native Manager", "Manager", "Native!123"),
            ("user@native.local", "Native User", "User", "Native!123")
        };

        foreach (var (email, fullName, role, password) in seededUsers)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user is null)
            {
                user = new User
                {
                    UserName = email,
                    Email = email,
                    FullName = fullName,
                    Role = role,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(user, password);
                if (!createResult.Succeeded)
                {
                    var errorDescriptions = string.Join(", ", createResult.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to create seeded user '{email}': {errorDescriptions}");
                }
            }
            else if (user.Role != role)
            {
                user.Role = role;
                await userManager.UpdateAsync(user);
            }

            if (!await userManager.IsInRoleAsync(user, role))
            {
                await userManager.AddToRoleAsync(user, role);
            }
        }
    }
}
