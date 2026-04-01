import * as fs from 'fs';
import * as path from 'path';

const content = fs.readFileSync('debug-list.html', 'utf-8');
const searchStr = 'data-testid="name"';
let pos = 0;
let count = 0;

while ((pos = content.indexOf(searchStr, pos)) !== -1) {
    count++;
    if (count < 5 || count > 290) {
        console.log(`Match ${count} at ${pos}: ${content.substring(pos, pos + 200)}`);
    }
    pos += searchStr.length;
}
console.log(`Total data-testid="name" matches: ${count}`);
