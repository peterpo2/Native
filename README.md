# Native CRM

A monorepo that powers the Native CRM experience with a React + Vite frontend and an ASP.NET Core backend.

## Project Structure

- `src/`, `public/` – Frontend application built with React, TypeScript, Tailwind CSS, and shadcn-ui.
- `Native.Backend/` – ASP.NET Core 8 solution containing API, Core, Infrastructure, and Workers projects.
- `docker-compose.yml` – Spins up both the frontend and backend with a single command.

## Prerequisites

- Node.js 20+
- npm 9+
- .NET SDK 8.0+
- Docker Desktop (optional, required for containerised development)

## Local Development

### Frontend

```bash
npm install
npm run dev
```

The Vite dev server runs on [http://localhost:5173](http://localhost:5173).

### Backend

```bash
cd Native.Backend
dotnet restore
cd Native.Api
dotnet run
```

The API listens on `http://localhost:5000` by default (see `Program.cs` for configuration details).

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
