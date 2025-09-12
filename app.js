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
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

const appPath = app.getAppPath();
const tempPath = path.join(os.tmpdir(), app.getName());
const pageRender = new PageRender(appPath);
const window = new Window(appPath, tempPath);
const fileManager = new FileManager(appPath);
const store = new Store();

pageRender.setHelpers();
app.whenReady().then(() => { window.init(); });
FileManager.createDir(tempPath);

i18next.use(Backend).init({
    lng: 'en', //app.getLocale(), // hoặc 'en', 'vi', ...
    backend: {
        loadPath: path.join(__dirname, 'locales/{{lng}}.json')
    }
});

SqliteExecution.openDatabase(`${tempPath}\\app.db`)
    .then(() => {
        const sql = fileManager.getFileContent('/sql/', 'app.sql');
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

const fontAwesomePath = path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free');
const fontAwesomeTempPath = path.join(tempPath, 'fontawesome-free');
FileManager.copyDir(fontAwesomePath, fontAwesomeTempPath);

const videoJsPath = path.join(__dirname, 'node_modules/video.js/dist');
const videoJsTempPath = path.join(tempPath, 'video-js');
FileManager.copyDir(videoJsPath, videoJsTempPath);

const videoJsHttpStreamingPath = path.join(__dirname, 'node_modules/@videojs/http-streaming/dist');
const videoJsHttpStreamingTempPath = path.join(tempPath, 'videojs-http-streaming');
FileManager.copyDir(videoJsHttpStreamingPath, videoJsHttpStreamingTempPath);

const videoJsQualitySelectorPath = path.join(__dirname, 'node_modules/videojs-hls-quality-selector/dist');
const videoJsQualitySelectorTempPath = path.join(tempPath, 'videojs-hls-quality-selector');
FileManager.copyDir(videoJsQualitySelectorPath, videoJsQualitySelectorTempPath);

const handler = Handler.Init({ appPath: appPath, tempPath: tempPath } ,window, pageRender, fileManager);
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
    try {
        store.set('list.selected', id);

        SqliteExecution.closeDatabase();
        app.relaunch();
        app.exit(0);
    } catch (err) {
        console.debug(err.message);
        await window.showMsgBox('info', 'Error', err.message, ['OK'])
    }
});

ipcMain.on('goto.about', async (event) => {
    try {
        await handler.loadAbout();
    } catch (err) {
        console.debug(err.message);
        await window.showMsgBox('info', 'Error', err.message, ['OK'])
    }
});

ipcMain.on('link.open', async (event, url) => {
    try {
        await shell.openExternal(url);
    } catch (err) {
        console.debug(err.message);
        await window.showMsgBox('info', 'Error', err.message, ['OK'])
    }
});