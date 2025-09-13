const fs = require('fs');
const path = require('path');

// Create necessary directories
const dirs = [
  'api',
  'public',
  'src'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Move client files to root
const moveFiles = [
  { from: 'client/public', to: 'public' },
  { from: 'client/src', to: 'src' },
  { from: 'client/package.json', to: 'package.json' },
  { from: 'client/package-lock.json', to: 'package-lock.json' }
];

moveFiles.forEach(({ from, to }) => {
  if (fs.existsSync(from)) {
    if (fs.lstatSync(from).isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
});

// Convert server routes to API routes
if (fs.existsSync('server/routes')) {
  const serverFiles = fs.readdirSync('server/routes');
  serverFiles.forEach(file => {
    if (file.endsWith('.js')) {
      const routeName = path.basename(file, '.js');
      const apiPath = path.join('api', `${routeName}.js`);
      
      const content = `
import { createHandler } from '@vercel/node';
import { ${routeName} } from '../server/routes/${routeName}';

export default createHandler(${routeName});
      `;
      
      fs.writeFileSync(apiPath, content);
    }
  });
}

console.log('Project restructuring complete!');
console.log('Next steps:');
console.log('1. Update imports in src files to reflect new structure');
console.log('2. Run npm install to update dependencies');
console.log('3. Test the application locally');
console.log('4. Deploy to Vercel'); 