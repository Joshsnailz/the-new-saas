import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('dist', { recursive: true });
writeFileSync('dist/.keep', 'api build placeholder\n');
console.log('api build complete');
