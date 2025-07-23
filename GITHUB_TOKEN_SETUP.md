# GitHub API Token Setup for shadcn-ui MCP Server

## Why you need a token:
- **Without token**: Limited to 60 API requests per hour
- **With token**: Up to 5,000 requests per hour
- Better reliability and faster responses

## Setup Instructions:

### 1. Generate GitHub Token
1. Go to [GitHub Settings](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Add a note: "shadcn-ui MCP server"
4. **Expiration**: Choose your preference (90 days recommended)
5. **Scopes**: ✅ **No scopes needed!** (public repository access is sufficient)
6. Click "Generate token"
7. **Copy the token** (starts with `ghp_`) - save it securely!

### 2. Update Cursor Configuration

Replace `ghp_your_token_here` in `.cursor/settings.json` with your actual token:

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_actual_token_here"
      }
    }
  }
}
```

### 3. Alternative: Environment Variable

You can also set it as an environment variable:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
```

Then remove the `env` section from the settings.json file.

## Test the Setup

After adding your token, restart Cursor and test by asking:
"Show me the source code for the shadcn/ui button component"

The AI should now be able to access shadcn/ui components directly! 