// Demo mode bootstrap — set env vars BEFORE any NestJS modules load.
// On Hostinger: set Application Startup File to "start-demo.js"
// To go LIVE: switch startup file back to "dist/main.js" and set real env vars.

process.env.DEMO_MODE   = 'true';
process.env.NODE_ENV    = 'development';
process.env.PORT        = process.env.PORT || '3001';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://settlementos.com.au';
process.env.APP_URL     = process.env.APP_URL || 'https://api.settlementos.com.au';

// Use whatever JWT_SECRET is already set, or fall back to a demo-safe default.
// IMPORTANT: Replace this before going live with a real 64-char secret.
process.env.JWT_SECRET  = process.env.JWT_SECRET || 'demo-only-jwt-secret-change-before-live-xK9mP2nQ';

process.env.PEXA_MOCK_MODE     = 'true';
process.env.DOCUSIGN_MOCK_MODE = 'true';

// Now load the compiled NestJS app — IS_DEMO will be true when app.module.ts loads
require('./dist/main');
