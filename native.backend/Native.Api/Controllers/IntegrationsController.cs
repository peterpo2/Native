using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Native.Api.DTOs;
using Native.Api.Options;
using Native.Core.Entities;
using Native.Core.Interfaces;
using Native.Core.Models;

namespace Native.Api.Controllers;

[ApiController]
[Route("api/integrations")]
[Authorize]
public class IntegrationsController : ControllerBase
{
    private readonly IIntegrationService _integrationService;
    private readonly IOptions<DropboxOptions> _dropboxOptions;
    private readonly UserManager<User> _userManager;

    public IntegrationsController(
        IIntegrationService integrationService,
        IOptions<DropboxOptions> dropboxOptions,
        UserManager<User> userManager)
    {
        _integrationService = integrationService;
        _dropboxOptions = dropboxOptions;
        _userManager = userManager;
    }

    [HttpGet("dropbox/status")]
    public async Task<IActionResult> GetDropboxStatus(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var connection = await _integrationService.GetConnectionAsync(userId, "dropbox", cancellationToken);
        var options = _dropboxOptions.Value;

        var isConfigured = options.IsConfigured;
        string? authorizationUrl = null;
        string? state = null;

        if (isConfigured)
        {
            state = Guid.NewGuid().ToString("N");
            authorizationUrl = BuildAuthorizationUrl(options, state);
        }

        return Ok(new DropboxStatusResponse(
            isConfigured,
            connection is not null,
            authorizationUrl,
            state,
            connection?.ConnectedAt,
            connection?.AccountId));
    }

    [HttpPost("dropbox/connect")]
    public async Task<IActionResult> ConnectDropbox(DropboxConnectRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.AccessToken))
        {
            return BadRequest("Access token is required.");
        }

        var userId = GetUserId();
        var organizationId = await GetOrganizationIdAsync(userId, cancellationToken);

        var connection = await _integrationService.SaveConnectionAsync(
            userId,
            new IntegrationConnectionInput(
                "dropbox",
                request.AccessToken,
                request.RefreshToken,
                request.ExpiresAt,
                request.AccountId,
                organizationId),
            cancellationToken);

        return Ok(new DropboxConnectResponse(true, connection.ConnectedAt, connection.AccountId));
    }

    [HttpDelete("dropbox/connect")]
    public async Task<IActionResult> DisconnectDropbox(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _integrationService.RemoveConnectionAsync(userId, "dropbox", cancellationToken);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id is null || !Guid.TryParse(id, out var userId))
        {
            throw new InvalidOperationException("User identifier missing from token");
        }

        return userId;
    }

    private async Task<Guid?> GetOrganizationIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user?.OrganizationId;
    }

    private static string BuildAuthorizationUrl(DropboxOptions options, string state)
    {
        var scopes = options.Scopes is { Length: > 0 }
            ? string.Join(" ", options.Scopes)
            : "files.metadata.read files.content.write";

        var query = new Dictionary<string, string>
        {
            ["client_id"] = options.ClientId!,
            ["response_type"] = "code",
            ["redirect_uri"] = options.RedirectUri!,
            ["token_access_type"] = "offline",
            ["scope"] = scopes
        };

        if (!string.IsNullOrEmpty(state))
        {
            query["state"] = state;
        }

        var queryString = string.Join("&", query.Select(pair => $"{pair.Key}={Uri.EscapeDataString(pair.Value)}"));
        return $"https://www.dropbox.com/oauth2/authorize?{queryString}";
    }
}
