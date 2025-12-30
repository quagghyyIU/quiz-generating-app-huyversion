const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');

// Folder display names (can be customized)
const folderDisplayNames = {
    'sns': 'SNS - System & Network Security',
    'sna': 'SNA - System & Network Admin',
    'uncategorized': 'Uncategorized'
};

// Read all subdirectories and their JSON files
fs.readdir(dataDir, { withFileTypes: true }, (err, entries) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    const folders = [];
    let pendingReads = 0;

    // Get all subdirectories
    const subdirs = entries.filter(entry => entry.isDirectory());
    
    if (subdirs.length === 0) {
        // No subdirectories, wrap files in an uncategorized folder
        const jsonFiles = entries
            .filter(entry => entry.isFile())
            .filter(entry => entry.name !== 'index.json')
            .filter(entry => path.extname(entry.name).toLowerCase() === '.json')
            .map(entry => entry.name);
        
        // Create proper folder structure with uncategorized folder
        const fallbackFolders = jsonFiles.length > 0 ? [{
            id: 'uncategorized',
            name: folderDisplayNames['uncategorized'] || 'Uncategorized',
            files: jsonFiles.sort()
        }] : [];
        
        writeIndex({ folders: fallbackFolders });
        return;
    }

    pendingReads = subdirs.length;

    subdirs.forEach(subdir => {
        const subdirPath = path.join(dataDir, subdir.name);
        
        fs.readdir(subdirPath, (err, files) => {
            if (err) {
                console.error(`Could not read directory ${subdir.name}`, err);
                pendingReads--;
                if (pendingReads === 0) writeIndex({ folders });
                return;
            }

            const jsonFiles = files
                .filter(file => file !== 'index.json')
                .filter(file => path.extname(file).toLowerCase() === '.json');

            if (jsonFiles.length > 0) {
                folders.push({
                    id: subdir.name,
                    name: folderDisplayNames[subdir.name] || subdir.name,
                    files: jsonFiles.sort()
                });
            }

            pendingReads--;
            if (pendingReads === 0) {
                // Sort folders: uncategorized last, others alphabetically
                folders.sort((a, b) => {
                    if (a.id === 'uncategorized') return 1;
                    if (b.id === 'uncategorized') return -1;
                    return a.name.localeCompare(b.name);
                });
                writeIndex({ folders });
            }
        });
    });
});

function writeIndex(data) {
    const indexContent = JSON.stringify(data, null, 2);
    const indexPath = path.join(dataDir, 'index.json');

    fs.writeFile(indexPath, indexContent, err => {
        if (err) {
            console.error('Failed to write index.json', err);
            process.exit(1);
        }
        console.log('index.json updated successfully!');
        console.log(`Found ${data.folders.length} folders:`);
        data.folders.forEach(f => {
            console.log(`  - ${f.name}: ${f.files.length} quizzes`);
        });
    });
}
