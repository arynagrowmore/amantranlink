import fs from 'fs';

const content = fs.readFileSync('server.js', 'utf8');
const lines = content.split('\n');
const routes = [];

const routeRegex = /app\.(get|post|put|delete|patch|options|all)\s*\(\s*(\[[^\]]+\]|'[^']+'|"[^"]+")/g;

lines.forEach((line, idx) => {
  let match;
  while ((match = routeRegex.exec(line)) !== null) {
    const method = match[1].toUpperCase();
    let path = match[2];
    routes.push({ line: idx + 1, method, path });
  }
});

console.log(JSON.stringify(routes, null, 2));
