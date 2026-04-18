import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const searchDir = path.join(__dirname, 'frontend', 'src');

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('http://localhost:5000')) {
                console.log(`Updating ${filePath}`);
                content = content.replace(/http:\/\/localhost:5000/g, '');
                fs.writeFileSync(filePath, content);
            }
        }
    });
}

walk(searchDir);
console.log('Done replacement');
