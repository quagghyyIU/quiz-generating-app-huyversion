/**
 * File watcher for auto-updating index.json when quiz files/folders change
 * Only used during development (npm run dev)
 */

const chokidar = require('chokidar');
const path = require('path');
const { exec } = require('child_process');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const generateScript = path.join(__dirname, 'generate-quiz-list.js');

console.log('👀 Watching for changes in:', dataDir);
console.log('');

// Debounce to prevent multiple rapid updates
let debounceTimer = null;
const DEBOUNCE_MS = 500;

function regenerateIndex() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    console.log('🔄 Detected change, regenerating index.json...');
    
    exec(`node "${generateScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error regenerating index:', error.message);
        return;
      }
      if (stderr) {
        console.error('⚠️ Warning:', stderr);
      }
      console.log(stdout);
      console.log('✅ index.json updated!\n');
    });
  }, DEBOUNCE_MS);
}

// Watch for changes
const watcher = chokidar.watch(dataDir, {
  ignored: [
    /(^|[\/\\])\../,  // Ignore dotfiles
    '**/index.json',   // Ignore index.json itself
  ],
  persistent: true,
  ignoreInitial: true,
  depth: 2,  // Watch subfolders up to 2 levels deep
});

watcher
  .on('add', (filePath) => {
    console.log(`📄 File added: ${path.relative(dataDir, filePath)}`);
    regenerateIndex();
  })
  .on('unlink', (filePath) => {
    console.log(`🗑️  File removed: ${path.relative(dataDir, filePath)}`);
    regenerateIndex();
  })
  .on('addDir', (dirPath) => {
    if (dirPath !== dataDir) {
      console.log(`📁 Folder added: ${path.relative(dataDir, dirPath)}`);
      regenerateIndex();
    }
  })
  .on('unlinkDir', (dirPath) => {
    console.log(`🗑️  Folder removed: ${path.relative(dataDir, dirPath)}`);
    regenerateIndex();
  })
  .on('ready', () => {
    console.log('✅ File watcher ready! Watching for changes...');
    console.log('   Add/remove .json files or folders to auto-update index.json');
    console.log('');
  })
  .on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping file watcher...');
  watcher.close();
  process.exit(0);
});


