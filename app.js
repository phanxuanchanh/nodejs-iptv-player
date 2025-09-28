const { app, shell, ipcMain, Notification } = require("electron");
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
const PageParams = require('./logic/page-params.js');
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
FileManager.createDir(tempPath);

const selectedLanguage = store.get('language.selected');
let setupI18nextComplete = false;

i18next.use(Backend).init({
    //app.getLocale(), // hoặc 'en', 'vi', ...
    lng: (selectedLanguage === undefined || selectedLanguage == null) ? 'en' : selectedLanguage,
    backend: {
        loadPath: path.join(__dirname, 'locales/{{lng}}.json')
    }
});

i18next.on('initialized', () => { setupI18nextComplete = true; });

let isAppReady = false;
let firstRun = store.get('app.firstRun');
if (firstRun === undefined || firstRun === null) {
    firstRun = 'yes';
    store.set('app.firstRun', firstRun);
}

const interval1 = setInterval(() => {
    if (!setupI18nextComplete)
        return;

    clearInterval(interval1);
    app.whenReady().then(() => {
        window.init();

        if (firstRun === 'yes') {
            new Notification({ title: 'NodeJS-IPTV', body: i18next.t('first-run-message')}).show();
            firstRun = 'no';
            store.set('app.firstRun', firstRun);
        }

        isAppReady = true;
    });
}, 200);

let setupDbComplete = false;
let setupAssetsComplete = false;

const interval2 = setInterval(async () => {
    if (!isAppReady)
        return;

    try {
        clearInterval(interval2);
        await SqliteExecution.open(`${tempPath}\\app.db`);
        const sql = fileManager.getFileContent('/sql/', 'app.sql');
        SqliteExecution.db.exec(sql, (err) => {
            if (err) {
                console.debug(err);
                window.showMsgBox('info', i18next.t('msg-box-error-title'), `${err.message}`, ['OK']);
                app.exit(1);
            } else {
                console.debug('All tables are created');
                setupDbComplete = true;
            }
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

        setupAssetsComplete = true;
    } catch (err) {
        console.debug(err);
        window.showMsgBox('info', i18next.t('msg-box-error-title'), `${err.message}`, ['OK']);
        app.exit(1);
    }
}, 200)


/** @type {Handler} */
let handler = null;
const interval3 = setInterval(() => {
    if (!(setupDbComplete && setupAssetsComplete))
        return;

    clearInterval(interval3);
    handler = Handler.Init({ appPath: appPath, tempPath: tempPath }, window, pageRender, fileManager);
}, 200);

const selectedListIdRaw = store.get('list.selected');
const selectedListId = (selectedListIdRaw === undefined || selectedListIdRaw == null) ? 0 : parseInt(selectedListIdRaw, 10);

const interval4 = setInterval(async () => {
    if (!(handler !== null && handler.isReady))
        return;

    clearInterval(interval4);
    try {
        handler.setConfig({ selectedPlaylistId: selectedListId, selectedLanguage: selectedLanguage });

        if (selectedListId !== 0)
            await handler.loadChannels();
        else
            await handler.loadImportAndSelectPlaylist();
    } catch (err) {
        console.debug(err);
        await window.showMsgBox('info', i18next.t('msg-box-error-title'), err.message, ['OK']);
        app.exit(1);
    }

    SafeIpc.setWindow(window);

    SafeIpc.on('list.load', async (event, favorited, categoryName, search, page, pageSize) => {
        await handler.loadChannels(favorited, categoryName, search, page, pageSize);
    });

    SafeIpc.on("channel.get", async (event, id, search, page, pageSize) => {
        await handler.loadChannel(id, search, page, pageSize);
    });

    SafeIpc.handle('channel.addfavorite', async (event, id) => {
        return await handler.setFavoriteChannel(id, isFavorite = true);
    });

    SafeIpc.handle('channel.removefavorite', async (event, id) => {
        return await handler.setFavoriteChannel(id, isFavorite = false);
    });

    SafeIpc.on('add.m3u8.link', async (event, name, url) => {
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

    SafeIpc.on('history.add', async (event, pageParamsString) => {
        const pageParamsObject = PageParams.decodeAndGet(pageParamsString);

        if (pageParamsObject.listPage !== null)
            history.push(pageParamsObject.selectedPlaylistId, pageParamsObject.listPage, true);
        else if (pageParamsObject.playPage !== null)
            history.push(pageParamsObject.selectedPlaylistId, pageParamsObject.playPage, false);
        else
            await await window.showMsgBox('info', 'Error', 'Page params invalid', ['OK']);
    });

    SafeIpc.on('go.back', async (event) => {
        const pageParams = history.pop();

        if (pageParams === null || pageParams === undefined)
            await window.showMsgBox('info', 'Info', 'No more history to go back.', ['OK']);
        else if (pageParams.playPage !== null && pageParams.playPage !== undefined)
            await handler.loadChannel(pageParams.playPage.channelId, pageParams.playPage.search, pageParams.playPage.page, pageParams.playPage.pageSize);
        else if (pageParams.listPage !== null && pageParams.listPage !== undefined)
            await handler.loadChannels(pageParams.listPage.showFavoriteList, pageParams.listPage.categoryName, pageParams.listPage.search, pageParams.listPage.page, pageParams.listPage.pageSize);
        else
            await window.showMsgBox('info', 'Info', 'No more history to go back.', ['OK']);
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

    ipcMain.on('msgbox.show', async (event, type, title, message, buttons) => {
        await window.showMsgBox(type, title, message, buttons);
    });
}, 200);