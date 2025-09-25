using System;

namespace Native.Api.DTOs;

public record JobApplicationRequest(
    Guid JobOpeningId,
    string CandidateName,
    string Email,
    string? Phone,
    string? ResumeUrl,
    string? Notes,
    string? Stage);
