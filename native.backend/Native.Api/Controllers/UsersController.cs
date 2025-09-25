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
    [Authorize(Roles = "Admin")]
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

        if (!string.IsNullOrWhiteSpace(request.Email) && !string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
        {
            var setEmailResult = await _userManager.SetEmailAsync(user, request.Email!);
            if (!setEmailResult.Succeeded)
            {
                return BadRequest(new { errors = setEmailResult.Errors.Select(e => e.Description) });
            }

            var setUserNameResult = await _userManager.SetUserNameAsync(user, request.Email!);
            if (!setUserNameResult.Succeeded)
            {
                return BadRequest(new { errors = setUserNameResult.Errors.Select(e => e.Description) });
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            if (await _userManager.HasPasswordAsync(user))
            {
                var removeResult = await _userManager.RemovePasswordAsync(user);
                if (!removeResult.Succeeded)
                {
                    return BadRequest(new { errors = removeResult.Errors.Select(e => e.Description) });
                }
            }

            var addPasswordResult = await _userManager.AddPasswordAsync(user, request.Password!);
            if (!addPasswordResult.Succeeded)
            {
                return BadRequest(new { errors = addPasswordResult.Errors.Select(e => e.Description) });
            }
        }

        if (request.OrganizationId.HasValue)
        {
            user.OrganizationId = request.OrganizationId;
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
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
        {
            return NotFound();
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        return NoContent();
    }
}
