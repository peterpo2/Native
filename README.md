# Native CRM

A monorepo that powers the Native CRM experience with a React + Vite frontend and an ASP.NET Core backend.

## Project Structure

- `src/`, `public/` – Frontend application built with React, TypeScript, Tailwind CSS, and shadcn-ui.
- `Native.Backend/` – ASP.NET Core 8 solution containing API, Core, Infrastructure, and Workers projects.
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
4. **Restore .NET dependencies**:
   ```bash
   dotnet restore Native.Backend/Native.sln
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
cd Native.Backend
dotnet run --project Native.Api
```

The API listens on `http://localhost:5000` by default (see `Program.cs` for configuration details).

## Editor Setup

- **Visual Studio Code** – Recommended extensions are published in [`.vscode/extensions.json`](.vscode/extensions.json). VS Code will prompt you to install them the first time you open the workspace, or you can install them manually with `code --install-extension <extension-id>`.
- **Visual Studio 2022** – Import [`./.vsconfig`](.vsconfig) from `Tools` → `Get Tools and Features…` to automatically install the ASP.NET Core, Docker, and Node.js workloads used by this repository. Once the workloads are installed, you can open `Native.Backend/Native.sln` directly.

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
- Backend tests: `dotnet test` (from within `Native.Backend`)

## Deployment Notes

- Build the frontend for production with `npm run build`. The output is generated under `dist/`.
- Publish the backend with `dotnet publish Native.Api/Native.Api.csproj -c Release`.

Feel free to tailor the stack, tooling, and deployment strategy to fit your team's workflow.
