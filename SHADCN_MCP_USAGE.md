# shadcn-ui MCP Server Usage Guide

## What's Available

The shadcn-ui MCP server provides access to all shadcn/ui v4 components and blocks. You can now ask Cursor to:

### Component Operations
- **Get component source code**: "Show me the button component code"
- **Get component demos**: "Show me how to use the dialog component"
- **List all components**: "What shadcn/ui components are available?"
- **Get component metadata**: "What dependencies does the accordion component need?"

### Block Operations
- **Get complete blocks**: "Show me the dashboard-01 block"
- **List blocks by category**: "What dashboard blocks are available?"
- **Get blocks with components**: "Show me the calendar-01 block with all its components"

## Example Prompts

### For Components:
```
"Create a form using shadcn/ui components"
"Show me the source code for the card component"
"How do I use the select component?"
"What are the available form components?"
```

### For Blocks:
```
"Show me the dashboard-01 block implementation"
"What login blocks are available?"
"Create a sidebar using shadcn/ui blocks"
"Show me the calendar-01 block with all components"
```

### For Your Laravel/Inertia Project:
```
"Create a network switch management interface using shadcn/ui components"
"Build a dashboard for the Sherlock project using shadcn/ui"
"Create a settings page with shadcn/ui components"
"Show me how to integrate shadcn/ui with Inertia.js"
```

## Available Tools

The MCP server provides these tools:

1. **`get_component`** - Get component source code
2. **`get_component_demo`** - Get component usage examples  
3. **`list_components`** - List all available components
4. **`get_component_metadata`** - Get component dependencies and info
5. **`get_block`** - Get complete block implementations
6. **`list_blocks`** - List all available blocks with categories
7. **`get_directory_structure`** - Explore the shadcn/ui repository

## Integration Benefits

With this setup, Cursor can now:
- ✅ Access real-time shadcn/ui component code
- ✅ Provide accurate installation instructions
- ✅ Show proper usage examples
- ✅ Suggest appropriate components for your use cases
- ✅ Help with component customization
- ✅ Provide complete block implementations

## Next Steps

1. **Add your GitHub token** (see `GITHUB_TOKEN_SETUP.md`)
2. **Restart Cursor** to load the MCP server
3. **Test the integration** by asking for component code
4. **Start building** with enhanced shadcn/ui support!

The MCP server is now ready to help you build beautiful, consistent UIs for your Sherlock project! 🎨 