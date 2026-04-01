import * as fs from 'fs';
import * as path from 'path';

const content = fs.readFileSync('debug-all.html', 'utf-8');
const searchStr = '/en/Pokemon/Products/';
let pos = 0;
let count = 0;

while ((pos = content.indexOf(searchStr, pos)) !== -1) {
    count++;
    if (count < 5) {
        console.log(`Match ${count} at ${pos}: ${content.substring(pos, pos + 200)}`);
    }
    pos += searchStr.length;
}
console.log(`Total product links in debug-all.html: ${count}`);
