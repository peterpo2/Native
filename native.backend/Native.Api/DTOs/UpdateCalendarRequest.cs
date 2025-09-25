using System;

namespace Native.Api.DTOs;

public record UpdateCalendarRequest(
    string Name,
    string Visibility,
    Guid[]? SharedUserIds);
