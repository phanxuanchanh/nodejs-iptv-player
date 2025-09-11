const { BrowserWindow, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const FileManager = require("./shared/file");

class Window {
    constructor(appPath) {
        this.appPath = appPath;
        this.win = undefined;
        this.fileManager = new FileManager(appPath);
    }

    init() {
        this.win = new BrowserWindow({
            width: 900,
            height: 600,
            resizable: true,
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                nodeIntegration: false,
                contextIsolation: true,
            }
        });
    }

    async loadDefaultAssets() {
            const bootstrapcss = this.fileManager.getFileContent('/renderer/css/', 'bootstrap.min.css');
            const css = this.fileManager.getFileContent('/renderer/css/', 'styles.css');
            const bootstrapjs = this.fileManager.getFileContent('/renderer/js/', 'bootstrap.bundle.min.js');
            const rendererJs = this.fileManager.getFileContent('/renderer/js/', 'renderer.js');

            await this.win.webContents.insertCSS(bootstrapcss);
            await this.win.webContents.insertCSS(css);
            await this.win.webContents.executeJavaScript(bootstrapjs);
            await this.win.webContents.executeJavaScript(rendererJs);
    }

    async load(html, ...assetContents) {
        await this.win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
        await this.loadDefaultAssets();

        for (const content of assetContents) {
            if (content.type === 'js')
                await this.win.webContents.executeJavaScript(content.data);
            else
                await this.win.webContents.insertCSS(content.data);
        }
        await this.win.webContents.executeJavaScript('document.documentElement.style.visibility = "visible"');
    }

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