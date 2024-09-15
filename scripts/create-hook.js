const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'pre-commit');
const destinationPath = path.join(__dirname, '../.git/hooks', 'pre-commit');

if (fs.existsSync(destinationPath)) {
    console.log('File already exists, no action taken.');
} else {
    fs.copyFile(sourcePath, destinationPath, (err) => {
        if (err) {
            console.error('Error moving the file:', err);
        } else {
            console.log(`File moved to ${destinationPath}`);
        }
    });
}
