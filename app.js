const { app, shell } = require("electron");
const os = require("os");
const path = require("path");
const Window = require('./logic/windows.js');
const PageRender = require('./shared/page-render.js');
const SqliteExecution = require('./shared/sqlite.js');
const FileManager = require('./shared/file.js');
const Service = require("./logic/serivce.js");
const History = require('./logic/history.js');
const Store = require('electron-store').default;
const Handler = require('./logic/handler.js');
const SafeIpc = require('./shared/safe-ipc.js');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

const appPath = app.getAppPath();
const tempPath = path.join(os.tmpdir(), app.getName());
const pageRender = new PageRender(appPath);
const window = new Window(appPath, tempPath);
const fileManager = new FileManager(appPath);
const history = new History();
const store = new Store();

pageRender.setHelpers();
app.whenReady().then(() => { window.init(); });
FileManager.createDir(tempPath);

const selectedLanguage = store.get('language.selected');

i18next.use(Backend).init({
    //app.getLocale(), // hoặc 'en', 'vi', ...
    lng: (selectedLanguage === undefined || selectedLanguage == null) ? 'en' : selectedLanguage,
    backend: {
        loadPath: path.join(__dirname, 'locales/{{lng}}.json')
    }
});

let setupDbComplete = false;

SqliteExecution.open(`${tempPath}\\app.db`)
    .then(() => {
        const sql = fileManager.getFileContent('/sql/', 'app.sql');
        SqliteExecution.db.exec(sql, (err) => {
            if (err) {
                console.debug(err);
                window.showMsgBox('info', 'Error', `${err.message}`, ['OK']);
                app.exit(1);
            } else {
                console.debug('All tables are created');
                setupDbComplete = true;
            }
        });
    }).catch((err) => {
        console.debug(err);
        window.showMsgBox('info', 'Error', `Error opening or populating the database: ${err}`, ['OK']);
        app.exit(1);
    });

let setupAssetsComplete = false;

try {
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

    setupAssetsComplete = true;
} catch (err) {
    console.debug('Error copying assets:', err);
    window.showMsgBox('info', 'Error', `Error copying assets: ${err}`, ['OK']);
    app.exit(1);
}

let handler = null;
const interval1 = setInterval(async () => {
    if (setupDbComplete && setupAssetsComplete) {
        clearInterval(interval1);
        handler = Handler.Init({ appPath: appPath, tempPath: tempPath }, window, pageRender, fileManager, history);
    }
}, 200);

const selectedListIdRaw = store.get('list.selected');
const selectedListId = (selectedListIdRaw === undefined || selectedListIdRaw == null) ? 0 : parseInt(selectedListIdRaw, 10);

const interval2 = setInterval(async () => {
    if (handler !== null && handler.isReady) {
        clearInterval(interval2);
        try {
            handler.setConfig({ selectedPlaylistId: selectedListId, selectedLanguage: selectedLanguage });

            if (selectedListId !== 0)
                await handler.loadChannels();
            else
                await handler.loadImportAndSelectPlaylist();
        } catch (err) {
            console.debug(err.message);
            await window.showMsgBox('info', 'Error', err.message, ['OK'])
        }
    }
}, 200);

SafeIpc.setWindow(window);

SafeIpc.on('list.load', async (event, search, page, pageSize) => {
    await handler.loadChannels(search, page, pageSize);
});

SafeIpc.on("channel.get", async (event, id, search, page, pageSize) => {
    await handler.loadChannel(id, search, page, pageSize);
});

SafeIpc.handle('channel.addfavorite', async (event, id) => {
    return await handler.setFavoriteChannel(id, isFavorite = true);
});

SafeIpc.handle('add.m3u8.link', async (event, name, url) => {
    if (url === null || url === undefined || url === '')
        window.showMsgBox('info', 'Invalid data', 'URL cannot be null, empty, or undefined', ['OK'])

    await Service.addPlaylist(name, url);

    SqliteExecution.close();
    app.relaunch();
    app.exit(0);
});

SafeIpc.on('list.select', async (event, id) => {
    store.set('list.selected', id);
    handler.setConfig({ selectedPlaylistId: id, selectedLanguage: selectedLanguage });
    SqliteExecution.close();

    app.relaunch();
    app.exit(0);
});

SafeIpc.on('goto.about', async (event) => {
    await handler.loadAbout();
});

SafeIpc.on('link.open', async (event, url) => {
    await shell.openExternal(url);
});

SafeIpc.on('settings.submit', async (event, lang) => {
    store.set('language.selected', lang);
    handler.setConfig({ selectedPlaylistId: selectedListId, selectedLanguage: lang });
    SqliteExecution.close();

    app.relaunch();
    app.exit(0);
});

SafeIpc.on('settings.reset', async (event) => {
    store.clear();
    await SqliteExecution.close();
    FileManager.deleteDir(tempPath);
    
    app.relaunch();
    app.exit(0);
});