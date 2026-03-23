import fs from 'fs';
import path from 'path';

const version = 'v3.4.7';

function updateVersionInFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  if (lines.length > 0 && lines[0].startsWith('// ')) {
    const match = lines[0].match(/\s+v\d+\.\d+\.\d+/);
    if (match) {
      lines[0] = lines[0].replace(/v\d+\.\d+\.\d+/, version);
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`Updated ${filePath}`);
    } else {
      // Add version if missing
      lines[0] = `${lines[0]} ${version}`;
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`Added version to ${filePath}`);
    }
  }
}

function walkDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      updateVersionInFile(fullPath);
    }
  }
}

walkDir(path.join(process.cwd(), 'app'));
walkDir(path.join(process.cwd(), 'i18n'));
updateVersionInFile(path.join(process.cwd(), 'middleware.ts'));
updateVersionInFile(path.join(process.cwd(), 'server.ts'));
