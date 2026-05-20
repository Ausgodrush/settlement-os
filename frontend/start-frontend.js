// Hostinger startup file for the Next.js frontend.
// Set Application Startup File to "start-frontend.js" in hPanel → Node.js settings.
// To go LIVE: keep this file; just update NEXT_PUBLIC_* in .env.production and rebuild.

process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

require('./.next/standalone/server.js');
