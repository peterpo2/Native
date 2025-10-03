using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Native.Api.DTOs;
using Native.Core.Entities;

namespace Native.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public UsersController(UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .Where(u => !u.IsDeleted)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FullName,
                u.Role,
                u.OrganizationId,
                u.IsTwoFactorEnabled,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("lookup")]
    public IActionResult Lookup()
    {
        var users = _userManager.Users
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email
            })
            .OrderBy(u => u.FullName);
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null || user.IsDeleted)
        {
            return NotFound();
        }

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.OrganizationId,
            user.IsTwoFactorEnabled,
            user.CreatedAt
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser(CreateUserRequest request)
    {
        var trimmedRole = request.Role?.Trim();
        var roleName = string.IsNullOrWhiteSpace(trimmedRole) ? "User" : trimmedRole!;
        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
        }

        var normalizedEmail = _userManager.NormalizeEmail(request.Email);
        var existing = await _userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

        if (existing is not null)
        {
            if (!existing.IsDeleted)
            {
                return Conflict(new { message = "A user with this email already exists." });
            }

            existing.FullName = request.FullName;
            existing.Role = roleName;
            existing.OrganizationId = request.OrganizationId;
            existing.UserName = request.Email;
            existing.Email = request.Email;
            existing.NormalizedEmail = normalizedEmail;
            existing.NormalizedUserName = _userManager.NormalizeName(request.Email);
            existing.IsDeleted = false;
            existing.IsTwoFactorEnabled = false;
            existing.LockoutEnd = null;
            existing.LockoutEnabled = true;
            existing.AccessFailedCount = 0;

            var currentRoles = await _userManager.GetRolesAsync(existing);
            if (currentRoles.Any())
            {
                await _userManager.RemoveFromRolesAsync(existing, currentRoles);
            }

            await _userManager.AddToRoleAsync(existing, roleName);

            existing.PasswordHash = _userManager.PasswordHasher.HashPassword(existing, request.Password);
            await _userManager.UpdateSecurityStampAsync(existing);

            var reactivateResult = await _userManager.UpdateAsync(existing);
            if (!reactivateResult.Succeeded)
            {
                return BadRequest(new { errors = reactivateResult.Errors.Select(e => e.Description) });
            }

            return Ok(new
            {
                existing.Id,
                existing.Email,
                existing.FullName,
                existing.Role,
                existing.OrganizationId,
                existing.IsTwoFactorEnabled,
                existing.CreatedAt
            });
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            Role = roleName,
            OrganizationId = request.OrganizationId,
            IsTwoFactorEnabled = false
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(new { errors = createResult.Errors.Select(e => e.Description) });
        }

        await _userManager.AddToRoleAsync(user, roleName);

        return CreatedAtAction(
            nameof(GetUser),
            new { id = user.Id },
            new
            {
                user.Id,
                user.Email,
                user.FullName,
                user.Role,
                user.OrganizationId,
                user.IsTwoFactorEnabled,
                user.CreatedAt
            });
    }

    [HttpPatch("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(Guid id, UpdateUserRequest request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null || user.IsDeleted)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Role) && !await _roleManager.RoleExistsAsync(request.Role))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(request.Role));
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            user.FullName = request.FullName!;
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Any())
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
            }

            user.Role = request.Role!;
            await _userManager.AddToRoleAsync(user, request.Role!);
        }

        if (request.TwoFactorEnabled.HasValue)
        {
            user.IsTwoFactorEnabled = request.TwoFactorEnabled.Value;
        }

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return BadRequest(new { errors = updateResult.Errors.Select(e => e.Description) });
        }

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.OrganizationId,
            user.IsTwoFactorEnabled
        });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
        {
            return NotFound();
        }

        if (user.IsDeleted)
        {
            return NoContent();
        }

        user.IsDeleted = true;
        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.MaxValue;
        await _userManager.UpdateSecurityStampAsync(user);

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        return NoContent();
    }
}
