# Native CRM

A monorepo that powers the Native CRM experience with a React + Vite frontend and an ASP.NET Core backend.

## Project Structure

- `src/`, `public/` – Frontend application built with React, TypeScript, Tailwind CSS, and shadcn-ui.
- `native.backend/` – ASP.NET Core 8 solution containing API, Core, Infrastructure, and Workers projects.
- `docker-compose.yml` – Spins up both the frontend and backend with a single command.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 20.x (LTS) | Includes `npm`, which the frontend uses for dependency management. |
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0.x | Required for the ASP.NET Core backend projects. |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest (optional) | Needed only if you plan to run the stack via Docker Compose. |

> ℹ️ Install the .NET workload using either Visual Studio or the standalone SDK. If you use Visual Studio, you can import the `.vsconfig` file in this repo to install the recommended workloads automatically (see [Editor Setup](#editor-setup)).

## First-time Setup (after cloning)

1. **Install prerequisites** listed above.
2. **Install editor tooling** (optional but recommended):
   - **VS Code** – open the Command Palette and run `Extensions: Show Recommended Extensions` to install everything listed in [`.vscode/extensions.json`](.vscode/extensions.json). You can also run `code --install-extension <extension-id>` in a terminal if you prefer to script it.
   - **Visual Studio 2022** – go to `Tools` → `Get Tools and Features…` and import [`./.vsconfig`](.vsconfig) to add the ASP.NET, Docker, and Node.js workloads this project uses.
3. **Install JavaScript dependencies**:
   ```bash
   npm install
   ```
4. **Restore .NET dependencies** (the solution file is checked in under `native.backend/Native.sln`):
   ```bash
   dotnet restore native.backend/Native.sln
   ```
5. **Create environment files (if needed)** – copy any sample `.env` files in the repo and adjust values for your environment.
6. **Run the services** using one of the flows below.

## Local Development

### Frontend

```bash
npm run dev
```

The Vite dev server runs on [http://localhost:5173](http://localhost:5173).

### Backend

```bash
cd native.backend
dotnet run --project Native.Api
```

The API listens on `http://localhost:5000` by default (see `Program.cs` for configuration details).

#### Dropbox integration

The backend exposes `/api/integrations/dropbox/*` endpoints that manage the Dropbox connection on a per-user basis. To enable the
flow:

1. [Create a Dropbox app](https://www.dropbox.com/developers/apps) and configure an OAuth 2 redirect URI (e.g. `http://localhost:5173/auth/dropbox`).
2. Add the credentials to the backend configuration via environment variables or `appsettings.Development.json`:

   ```bash
   export Dropbox__ClientId="<your-app-key>"
   export Dropbox__ClientSecret="<your-app-secret>"
   export Dropbox__RedirectUri="http://localhost:5173/auth/dropbox"
   # Optional: override scopes (defaults to files.metadata.read files.content.write)
   # export Dropbox__Scopes__0="files.metadata.read"
   # export Dropbox__Scopes__1="files.content.write"
   ```

3. Start the backend and log in via the UI. The **Integrations** widget now shows the Dropbox connection status.
4. To generate an authorization URL, call `GET /api/integrations/dropbox/status` with your access token. The response includes `authorizationUrl` and a `state` parameter. Visit that URL in a browser to grant access.
5. Exchange the resulting authorization code for tokens using the Dropbox token endpoint, for example:

   ```bash
   curl https://api.dropboxapi.com/oauth2/token \
     -d code="<code-from-redirect>" \
     -d grant_type=authorization_code \
     -d client_id="$Dropbox__ClientId" \
     -d client_secret="$Dropbox__ClientSecret" \
     -d redirect_uri="$Dropbox__RedirectUri"
   ```

6. Persist the tokens by calling `POST /api/integrations/dropbox/connect` with the access token payload:

   ```bash
   curl -X POST http://localhost:5000/api/integrations/dropbox/connect \
     -H "Authorization: Bearer <jwt-token>" \
     -H "Content-Type: application/json" \
     -d '{
       "accessToken": "<dropbox-access-token>",
       "refreshToken": "<dropbox-refresh-token>",
       "expiresAt": "2024-12-31T23:59:59Z",
       "accountId": "dbid:example"
     }'
   ```

   The response confirms the connection and the UI updates automatically. Disconnect at any time with `DELETE /api/integrations/dropbox/connect`.

#### Default accounts

The API seeds a few demo users the first time it starts. All passwords are `Native!123`.

| Role  | Email                  |
| ----- | ---------------------- |
| Admin | `admin@native.local`   |
| User  | `user@native.local`    |
| Manager | `manager@native.local` |

## Editor Setup

- **Visual Studio Code** – Recommended extensions are published in [`.vscode/extensions.json`](.vscode/extensions.json). VS Code will prompt you to install them the first time you open the workspace, or you can install them manually with `code --install-extension <extension-id>`.
- **Visual Studio 2022** – Import [`./.vsconfig`](.vsconfig) from `Tools` → `Get Tools and Features…` to automatically install the ASP.NET Core, Docker, and Node.js workloads used by this repository. Once the workloads are installed, open `native.backend/Native.sln` (which lives in this repo) so Visual Studio resolves each project path correctly.

## Run with Docker

You can start both the frontend and backend using Docker Compose. This is the easiest way to spin up the full stack without installing the toolchains locally.

```bash
docker compose up --build
```

- Frontend is available at [http://localhost:5173](http://localhost:5173)
- Backend is available at [http://localhost:5000](http://localhost:5000)

To tear everything down:

```bash
docker compose down
```

### Customisation Tips

- To enable hot reload against your local source code, uncomment the `volumes` sections for the services you want to live-edit in `docker-compose.yml`.
- Set `VITE_API_URL` in `.env` or the Docker Compose file if your API is hosted elsewhere.

## Testing & Linting

- Frontend linting: `npm run lint`
- Backend tests: `dotnet test` (from within `native.backend`)

## Deployment Notes

- Build the frontend for production with `npm run build`. The output is generated under `dist/`.
- Publish the backend with `dotnet publish Native.Api/Native.Api.csproj -c Release`.

Feel free to tailor the stack, tooling, and deployment strategy to fit your team's workflow.
