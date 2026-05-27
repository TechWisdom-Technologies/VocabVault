const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'public', 'VocabVault Logo.png');
const dest = path.join(__dirname, '..', 'public', 'favicon.ico');

if (!fs.existsSync(src)) {
  console.error('Source not found:', src);
  process.exit(1);
}

try {
  fs.copyFileSync(src, dest);
  console.log('Copied', src, '->', dest);
} catch (err) {
  console.error('Failed to copy:', err);
  process.exit(1);
}
