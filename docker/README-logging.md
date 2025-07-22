# Sherlock Logging Stack

This setup provides a modern, lightweight logging solution using Grafana Loki and Grafana.

## Components

- **Fluent Bit**: Lightweight log forwarder that watches Laravel logs
- **Loki**: Efficient log aggregation and storage
- **Grafana**: Beautiful UI for log browsing and visualization
- **MinIO**: S3-compatible object storage (optional, for log persistence)

## Access Points

- **Grafana UI**: http://localhost:3000 (admin/admin)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## Features

- **Real-time log streaming** from Laravel application
- **Structured log parsing** with proper timestamps and log levels
- **Beautiful Grafana dashboards** with log volume and error rate metrics
- **Log retention** (30 days by default)
- **Search and filtering** capabilities
- **Dark mode UI** for better readability

## Usage

1. Start the stack:
   ```bash
   docker-compose -f docker-compose.prod.yaml up -d
   ```

2. Access Grafana at http://localhost:3000
   - Username: `admin`
   - Password: `admin`

3. The "Sherlock Laravel Logs" dashboard will be automatically loaded

## Log Queries

Example Loki queries you can use in Grafana:

- All logs: `{app="sherlock"}`
- Error logs only: `{app="sherlock", level="ERROR"}`
- Recent errors: `{app="sherlock", level="ERROR"} |= "Exception"`
- Search for specific text: `{app="sherlock"} |= "database"`

## Configuration

- Log retention: 30 days (configurable in `docker/loki/loki-config.yaml`)
- Log parsing: Laravel format with timestamps and log levels
- Dashboard refresh: 5 seconds 