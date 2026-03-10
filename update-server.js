import fs from 'fs';

const content = fs.readFileSync('server.ts', 'utf-8');
const updated = content.replace(/-L\.jpg/g, '-M.jpg');
fs.writeFileSync('server.ts', updated);
console.log('server.ts updated');
