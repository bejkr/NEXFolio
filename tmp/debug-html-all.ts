import * as fs from 'fs';
import * as path from 'path';

const content = fs.readFileSync('debug-all.html', 'utf-8');
const searchStr = 'data-testid="name"';
let pos = 0;
let count = 0;

while ((pos = content.indexOf(searchStr, pos)) !== -1) {
    count++;
    pos += searchStr.length;
}
console.log(`Total data-testid="name" matches in debug-all.html: ${count}`);
