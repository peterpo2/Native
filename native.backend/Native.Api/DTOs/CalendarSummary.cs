using System;
using System.Collections.Generic;

namespace Native.Api.DTOs;

public record CalendarSummary(
    Guid Id,
    string Name,
    string Visibility,
    Guid OwnerId,
    IEnumerable<Guid> SharedUserIds);
