const fs = require("fs");
const path = require("path");

/**
 *  * A class to manage file operations
 * | Một lớp để quản lý các thao tác tệp
 * @class FileManager
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

    /**
     * 
     * @param {string} dirPath 
     */
    static deleteDir(dirPath) {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
        }
    }
}

module.exports = FileManager;