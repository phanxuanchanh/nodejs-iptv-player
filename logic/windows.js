const { BrowserWindow, dialog } = require("electron");
const path = require("path");
const FileManager = require("../shared/file");

/**
 * 
 */
class Window {
    /**
     * 
     * @param {string} appPath 
     * @param {string} tempPath 
     */
    constructor(appPath, tempPath) {
        this.appPath = appPath;
        this.tempPath = tempPath;
        this.win = undefined;
        this.fileManager = new FileManager(appPath);
    }

    init() {
        this.win = new BrowserWindow({
            width: 900,
            height: 600,
            resizable: true,
            webPreferences: {
                preload: path.join(this.appPath, "preload.js"),
                nodeIntegration: false,
                contextIsolation: true,
                webSecurity: false
            }
        });
    }

    async #loadDefaultAssets() {
        const bootstrapcss = this.fileManager.getFileContent('/renderer/css/', 'bootstrap.min.css');
        const css = this.fileManager.getFileContent('/renderer/css/', 'styles.css');
        const bootstrapjs = this.fileManager.getFileContent('/renderer/js/', 'bootstrap.bundle.min.js');
        const rendererJs = this.fileManager.getFileContent('/renderer/js/', 'renderer.js');

        await this.win.webContents.insertCSS(bootstrapcss);
        await this.win.webContents.insertCSS(css);
        await this.win.webContents.executeJavaScript(bootstrapjs);
        await this.win.webContents.executeJavaScript(rendererJs);

        const fontAwesomePath = path.join(this.tempPath, 'fontawesome-free', 'css', 'all.min.css')
            .replace(/\\/g, '/');
        const linkFontAwesomeJs = `
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = "file://${fontAwesomePath}";
            document.head.appendChild(link);
            `;

        await this.win.webContents.executeJavaScript(linkFontAwesomeJs);
    }

    /**
     * 
     * @param {string} html 
     * @param {boolean} loadDefaultAssets
     * @param  {...{type: string, data: any}} assetContents
     */
    async load(html, loadDefaultAssets, ...assetContents) {
        await this.win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
        if(loadDefaultAssets)
            await this.#loadDefaultAssets();

        for (const content of assetContents) {
            if (content.type === 'js')
                await this.win.webContents.executeJavaScript(content.data);
            else
                await this.win.webContents.insertCSS(content.data);
        }
        
        await this.win.webContents.executeJavaScript('document.documentElement.style.visibility = "visible"');
    }

    /**
     * 
     * @param {string} type 
     * @param {string} title 
     * @param {string} message 
     * @param {string[]} buttons 
     */
    async showMsgBox(type, title, message, buttons) {
        await dialog.showMessageBox(this.win, {
            type: type,
            title: title,
            message: message,
            buttons: buttons
        })
    }
}

module.exports = Window;