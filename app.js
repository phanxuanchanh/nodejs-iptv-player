const { app, ipcMain, shell } = require("electron");
const os = require("os");
const path = require("path");
const Window = require('./windows.js');
const PageRender = require('./shared/page-render.js');
const SqliteExecution = require('./shared/sqlite.js');
const FileManager = require('./shared/file.js');
const Service = require("./serivce.js");
const Store = require('electron-store').default;
const Handler = require('./handler.js');

const appPath = app.getAppPath();
const tempPath = path.join(os.tmpdir(), app.getName());
const pageRender = new PageRender(appPath);
const window = new Window(appPath);
const fileManager = new FileManager(appPath);
const store = new Store();

pageRender.setHelpers();
app.whenReady().then(() => { window.init(); });
FileManager.createDir(tempPath);

SqliteExecution.openDatabase(`${tempPath}\\app.db`)
    .then(() => {
        const sql = fileManager.getFileContent('/', 'app.sql');
        SqliteExecution.db.exec(sql, (err) => {
            if (err)
                console.debug(err);
            else
                console.debug('All tables are created');
        });
    }).catch((err) => {
        window.showMsgBox('info', 'Error', `Error opening or populating the database: ${err}`, ['OK']);
        console.debug(err);
    });

const handler = Handler.Init(window, pageRender, fileManager);
const selectedListId = store.get('list.selected');

setTimeout(async () => {
    try {
        if (selectedListId)
            await handler.loadChannels(selectedListId);
        else
            await handler.loadImportAndSelectPlaylist();
    } catch (err) {
        window.showMsgBox('info', 'Error', err.message, ['OK'])
        console.debug(err);
    }
}, 3000);


ipcMain.on("list.load", async (event, search, page, pageSize) => {
    try {
        await handler.loadChannels(selectedListId, search, page, pageSize);
    } catch (err) {
        console.debug(err.message);
        await window.showMsgBox('info', 'Error', err.message, ['OK'])
    }
});

ipcMain.on("channel.get", async (event, id, search, page, pageSize) => {
    try {
        await handler.loadChannel(selectedListId, id, search, page, pageSize);
    } catch (err) {
        console.debug(err.message);
        await window.showMsgBox('info', 'Error', err.message, ['OK'])
    }
});

ipcMain.handle('add.m3u8.link', async (event, url) => {
    if (url === null || url === undefined || url === '')
        window.showMsgBox('info', 'Invalid data', 'URL cannot be null, empty, or undefined', ['OK'])

    await Service.addFromUrl(url);

    SqliteExecution.closeDatabase();
    app.relaunch();
    app.exit(0);
});

ipcMain.handle('list.select', async (event, id) => {
    store.set('list.selected', id);

    SqliteExecution.closeDatabase();
    app.relaunch();
    app.exit(0);
});

ipcMain.on('goto.about', async (event) => {
    await handler.loadAbout();
});

ipcMain.on('link.open', async (event, url) => {
    await shell.openExternal(url);
});