const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("Content-Type");
  const isJson = contentType?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.message ?? "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export const loginRequest = (payload: LoginPayload) =>
  request<AuthSuccessResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  organizationId?: string;
}

export const registerRequest = (payload: RegisterPayload) =>
  request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export interface TaskInput {
  projectId?: string | null;
  title: string;
  description?: string;
  assigneeId?: string | null;
  dueAt?: string | null;
  status?: string | null;
  priority?: string | null;
}

export interface TaskItem {
  id: string;
  projectId?: string | null;
  ownerId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export const fetchMyTasks = (token: string, params?: { status?: string; dueBefore?: string }) => {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.dueBefore) search.set("dueBefore", params.dueBefore);
  const query = search.size > 0 ? `?${search.toString()}` : "";
  return request<TaskItem[]>(`/api/task/mine${query}`, {
    method: "GET",
    token,
  });
};

export const createTask = (token: string, payload: TaskInput) =>
  request<TaskItem>("/api/task", {
    method: "POST",
    token,
    body: JSON.stringify({
      ...payload,
      projectId: payload.projectId ?? null,
    }),
  });

export interface CalendarSummary {
  id: string;
  name: string;
  visibility: "Private" | "Shared" | "Public";
  ownerId: string;
  sharedUserIds: string[];
}

export const fetchCalendars = (token: string) =>
  request<CalendarSummary[]>("/api/calendar", {
    method: "GET",
    token,
  });

export interface CalendarInput {
  name: string;
  visibility: "Private" | "Shared" | "Public";
  sharedUserIds?: string[];
}

export const createCalendar = (token: string, payload: CalendarInput) =>
  request<CalendarSummary>("/api/calendar", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

export const updateCalendar = (token: string, calendarId: string, payload: CalendarInput) =>
  request<CalendarSummary>(`/api/calendar/${calendarId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });

export const deleteCalendar = (token: string, calendarId: string) =>
  request<void>(`/api/calendar/${calendarId}`, {
    method: "DELETE",
    token,
  });

export interface CalendarEventInput {
  id?: string;
  calendarId: string;
  taskId?: string | null;
  title: string;
  location?: string | null;
  start: string;
  end: string;
  isAllDay?: boolean;
  provider?: string | null;
  externalEventId?: string | null;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  taskId?: string | null;
  title: string;
  location?: string | null;
  start: string;
  end: string;
  isAllDay: boolean;
  provider: string;
  externalEventId: string;
  createdById: string;
}

export const fetchCalendarEvents = (
  token: string,
  calendarId: string,
  params?: { start?: string; end?: string },
) => {
  const search = new URLSearchParams();
  if (params?.start) search.set("start", params.start);
  if (params?.end) search.set("end", params.end);
  const query = search.size > 0 ? `?${search.toString()}` : "";

  return request<CalendarEvent[]>(`/api/calendar/${calendarId}/events${query}`, {
    method: "GET",
    token,
  });
};

export const upsertCalendarEvent = (token: string, payload: CalendarEventInput) =>
  request<CalendarEvent>(`/api/calendar/${payload.calendarId}/events`, {
    method: "POST",
    token,
    body: JSON.stringify({
      ...payload,
      isAllDay: payload.isAllDay ?? false,
      taskId: payload.taskId ?? null,
      location: payload.location ?? null,
      provider: payload.provider ?? null,
      externalEventId: payload.externalEventId ?? null,
    }),
  });

export const deleteCalendarEvent = (token: string, calendarId: string, eventId: string) =>
  request<void>(`/api/calendar/${calendarId}/events/${eventId}`, {
    method: "DELETE",
    token,
  });

export interface UserLookupItem {
  id: string;
  email: string;
  fullName: string;
}

export const fetchUsersLookup = (token: string) =>
  request<UserLookupItem[]>("/api/users/lookup", {
    method: "GET",
    token,
  });

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId?: string | null;
  isTwoFactorEnabled: boolean;
  createdAt: string;
}

export const fetchUsers = (token: string) =>
  request<AdminUser[]>("/api/users", {
    method: "GET",
    token,
  });

export interface UpdateUserInput {
  fullName?: string;
  role?: string;
  twoFactorEnabled?: boolean;
  email?: string;
  password?: string;
  organizationId?: string | null;
}

export const updateUser = (token: string, userId: string, payload: UpdateUserInput) =>
  request<AdminUser>(`/api/users/${userId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });

export const deleteUser = (token: string, userId: string) =>
  request<void>(`/api/users/${userId}`, {
    method: "DELETE",
    token,
  });
