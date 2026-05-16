const fs = require('fs');
const html = fs.readFileSync('out2.txt', 'utf16le');
const links = html.match(/href="([^"]+)"/g) || [];
console.log([...new Set(links)].filter(l => l.includes('/p/')).slice(0, 10));
