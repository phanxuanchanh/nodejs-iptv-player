const fs = require("fs");
const path = require("path");

/**
 * 
 */
class FileManager {
    /**
     * 
     * @param {string} appPath 
     */
    constructor(appPath) {
        this.appPath = appPath;
    }

    /**
     * 
     * @param {string} filePath 
     * @param {string} fileName 
     * @returns {string}
     */
    getFileContent(filePath, fileName) {
        const content = fs.readFileSync(path.join(this.appPath, `${filePath}${fileName}`), "utf-8");
        return content;
    }

    /**
     * 
     * @param {string} path 
     */
    static createDir(path) {
        if (!fs.existsSync(path))
            fs.mkdirSync(path, { recursive: true });
    }

    /**
     * 
     * @param {string} srcPath 
     * @param {string} destPath 
     */
    static copyDir(srcPath, destPath) {
        if (!fs.existsSync(destPath))
            fs.cpSync(srcPath, destPath, { recursive: true });
    }
}

module.exports = FileManager;