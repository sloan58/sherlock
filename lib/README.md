# Lib Directory Structure

This directory contains external services and utilities for the Sherlock application.

## Directory Organization

### `/js` - JavaScript/Node.js Services
- **ssh-proxy.js** - WebSocket server for SSH terminal connections
- **package.json** - Node.js dependencies
- **Dockerfile** - Container configuration for the WebSocket service

### `/python` - Python Scripts and Utilities
- **mac_lookup.py** - MAC address manufacturer lookup utility
- **netmiko_command.py** - Network device communication via Netmiko
- **netmiko_test_command.py** - Testing utility for Netmiko connections
- **requirements.txt** - Python dependencies
- **.venv/** - Python virtual environment

### `/logs` - Application Logs
- Shared log directory for various services

## Docker Services

### WebSocket Service
The WebSocket service runs in a dedicated container and provides SSH terminal functionality:
- **Port**: 8080
- **Protocol**: WebSocket
- **Purpose**: SSH proxy for terminal connections to network devices

### Python Scripts
Python scripts are executed by the main Laravel application and should not be moved as they have specific path dependencies in the PHP codebase.

## Development Notes

- Python virtual environments should not be moved as they contain absolute paths
- The WebSocket service is containerized and can be scaled independently
- All Python scripts are referenced by absolute paths in the PHP codebase 