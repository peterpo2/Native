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
    }
}
