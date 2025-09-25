# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Native.Core/Native.Core.csproj Native.Core/
COPY Native.Infrastructure/Native.Infrastructure.csproj Native.Infrastructure/
COPY Native.Api/Native.Api.csproj Native.Api/
COPY Native.Workers/Native.Workers.csproj Native.Workers/
RUN dotnet restore Native.Api/Native.Api.csproj

COPY . .
RUN dotnet publish Native.Api/Native.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Native.Api.dll"]
