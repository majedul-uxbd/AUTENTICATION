const fs = require('fs');
const path = require('path');

const deleteUploadedFile = (file) => {
    if (!file) return;

    const filePath = file.path;

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('File delete failed:', err);
            }
        });
    }
};

module.exports = {
    deleteUploadedFile
}