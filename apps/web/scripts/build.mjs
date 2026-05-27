import { mkdirSync, copyFileSync } from 'node:fs';
mkdirSync('dist', { recursive: true });
copyFileSync('src/admin-rail-poc.html', 'dist/admin-rail-poc.html');
console.log('web build complete');
