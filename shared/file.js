const fs = require("fs");
const path = require("path");

class FileManager {
    constructor(appPath) {
        this.appPath = appPath;
    }

    getFileContent(filePath, fileName) {
        const content = fs.readFileSync(path.join(this.appPath, `${filePath}${fileName}`), "utf-8");
        return content;
    }

    getAssetContent(assetName) {
        const assetContent = fs.readFileSync(path.join(this.appPath, `renderer\\${assetName}`), "utf-8");
        return assetContent;
    }

    static createDir(path) {
        if (!fs.existsSync(path))
            fs.mkdirSync(path, { recursive: true });
    }
}

module.exports = FileManager;