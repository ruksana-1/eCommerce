
const fs = require('fs');
const path = require('path');

const errorFilePath = path.join(__dirname, 'errorPaths.json');

// Load existing error paths from file
let errorPaths = [];
try {
    if (fs.existsSync(errorFilePath)) {
        const data = fs.readFileSync(errorFilePath, 'utf8');
        errorPaths = JSON.parse(data);
    }
} catch (err) {
    console.error("Error loading error paths:", err);
}

const saveErrorPaths = () => {
    fs.writeFileSync(errorFilePath, JSON.stringify(errorPaths));
};

const deleteFiles = (filePaths) => {
    if (errorPaths.length > 0) {
        console.log('Attempting to delete previously failed paths:');

        errorPaths.forEach((errorPath, index) => {
            fs.unlink(errorPath, (error) => {
                if (error) {
                    console.error('Error deleting the image file from errorPaths');
                } else {
                    console.log('Successfully deleted the image file from errorPaths');
                    errorPaths.splice(index, 1);
                    saveErrorPaths();  // Save after modifying the list
                }
            });
        });
    }

    filePaths.forEach(filePath => {
        console.log('filepath : ', filePath);
        const fullPath = path.join(__dirname, '../public', filePath); 
        console.log('fullpath : ', fullPath);
        
        fs.unlink(fullPath, (error) => {
            if (error) {
                console.error('Error deleting the image File : ', error);

                if (!errorPaths.includes(fullPath)) {
                    errorPaths.push(fullPath);
                    console.log('image File added to errorPaths');
                    saveErrorPaths();  // Save after modifying the list
                }
            } else {
                console.log(`Successfully deleted the image file: ${fullPath}`);
            }
        });
    });
};

module.exports = { deleteFiles };


