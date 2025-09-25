using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Native.Api.DTOs;
using Native.Core.Entities;
using Native.Core.Interfaces;

namespace Native.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public AuthController(
        IAuthService authService,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        _authService = authService;
        _roleManager = roleManager;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var roleName = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role;
        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
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

        var result = await _authService.RegisterAsync(user, request.Password, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return CreatedAtAction(
            nameof(Register),
            new { userId = user.Id },
            new { user.Id, user.Email, user.FullName, user.Role, user.OrganizationId });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request.Email, request.Password, cancellationToken);
        if (result is null)
        {
            return Unauthorized();
        }

        return Ok(new AuthResponse(result.Token, result.ExpiresAt, result.User.Id, result.User.Email, result.User.FullName, result.User.Role));
    }
}
