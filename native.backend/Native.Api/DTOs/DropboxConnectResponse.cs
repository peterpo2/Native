using System;

namespace Native.Api.DTOs;

public record DropboxConnectResponse(bool Connected, DateTime ConnectedAt, string? AccountId);
