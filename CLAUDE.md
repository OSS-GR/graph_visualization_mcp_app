## Development Setup

This project uses npm with Node.js for package management and execution.

- Use `npm install` to install dependencies
- Use `npm run <script>` to run scripts defined in package.json
- Use `node <file.js>` to run JavaScript files
- Use `npx <package> <command>` to run packages

## Scripts

Build the project:
```bash
npm run build
```

Run the MCP server:
```bash
npm run serve
```

Development mode (build + serve):
```bash
npm run dev
```

## Build Process

The TypeScript is compiled to JavaScript via:
- `tsc --noEmit` - Type checking
- `vite build` - Bundling the React UI
- `tsc -p tsconfig.server.json` - Compiling the server code

Output is placed in `dist/` directory:
- `dist/main.js` - Server entry point
- `dist/src/index.html` - Single-file bundled UI

## Project Structure

- **server.ts** - MCP server registration
- **src/app.tsx** - React client entry point
- **src/components/** - React chart components
- **src/utils/** - Shared utilities
- **vite.config.ts** - Vite bundling configuration
- **tsconfig.json** - TypeScript configuration
