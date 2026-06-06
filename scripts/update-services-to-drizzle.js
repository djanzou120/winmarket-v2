#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to update
const dirs = [
  'apps/api/src/infrastructure/database/schema',
  'apps/api/src/infrastructure/database/seeds',
  'apps/api/src/modules'
];

function updateFile(filePath) {
  if (!fs.existsSync(filePath) || !filePath.endsWith('.ts')) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace CUID2 with UUID
  if (content.includes('createId') || content.includes('@paralleldrive/cuid2')) {
    content = content.replace(/import \{ createId \} from ["']@paralleldrive\/cuid2["'];?/g, 'import { randomUUID } from "crypto";');
    content = content.replace(/createId\(\)/g, 'randomUUID()');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dir) {
  const fullPath = path.join(process.cwd(), dir);

  if (!fs.existsSync(fullPath)) {
    console.log(`Directory not found: ${fullPath}`);
    return;
  }

  const files = fs.readdirSync(fullPath, { recursive: true });

  files.forEach(file => {
    const filePath = path.join(fullPath, file);
    if (fs.statSync(filePath).isFile()) {
      updateFile(filePath);
    }
  });
}

console.log('Updating CUID2 to UUID in schema and service files...');

dirs.forEach(processDirectory);

console.log('Update completed!');