const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Move client files to root
const moveFiles = [
  { from: 'client/public', to: 'public' },
  { from: 'client/src', to: 'src' },
  { from: 'client/package.json', to: 'package.json' },
  { from: 'client/package-lock.json', to: 'package-lock.json' }
];

moveFiles.forEach(({ from, to }) => {
  if (fs.existsSync(from)) {
    execSync(`cp -r ${from}/* ${to}/`);
  }
});

// Convert server routes to API routes
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

console.log('Project restructuring complete!');
console.log('Next steps:');
console.log('1. Update imports in src files to reflect new structure');
console.log('2. Run npm install to update dependencies');
console.log('3. Test the application locally');
console.log('4. Deploy to Vercel'); 