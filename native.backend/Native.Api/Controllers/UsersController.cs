using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Native.Api.DTOs;
using Native.Core.Entities;

namespace Native.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
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
    public IActionResult GetUsers()
    {
        var users = _userManager.Users
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FullName,
                u.Role,
                u.OrganizationId,
                u.IsTwoFactorEnabled,
                u.CreatedAt
            });
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
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

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, UpdateUserRequest request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
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
}
