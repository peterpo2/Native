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
    private readonly UserManager<User> _userManager;

    public AuthController(IAuthService authService, UserManager<User> userManager)
    {
        _authService = authService;
        _userManager = userManager;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            Role = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role
        };

        if (!await _userManager.RoleExistsAsync(user.Role))
        {
            await _userManager.CreateAsync(new IdentityRole<Guid>(user.Role));
        }

        var result = await _authService.RegisterAsync(user, request.Password, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return CreatedAtAction(nameof(Register), new { userId = user.Id }, new { user.Id, user.Email, user.FullName, user.Role });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var token = await _authService.LoginAsync(request.Email, request.Password, cancellationToken);
        if (token is null)
        {
            return Unauthorized();
        }

        return Ok(new AuthResponse(token, DateTime.UtcNow.AddHours(8)));
    }
}
