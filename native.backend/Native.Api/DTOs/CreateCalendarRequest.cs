using System;

namespace Native.Api.DTOs;

public record CreateCalendarRequest(
    string Name,
    string Visibility,
    Guid[]? SharedUserIds);
