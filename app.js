const { app, ipcMain } = require("electron");
const os = require("os");
const path = require("path");
const Window = require('./windows.js');
const PageRender = require('./shared/page-render.js');
const SqliteExecution = require('./shared/sqlite.js');
const FileManager = require('./shared/file.js');
const Service = require("./serivce.js");
const Store = require('electron-store').default;

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
        window.showMsgBox('info', 'Error', 'Khởi tạo CSDL đã thất bại', ['OK']);
        console.debug(err);
    });

const homejs = fileManager.getAssetContent('pages/home.js');
const playjs = fileManager.getAssetContent('pages/play.js');
const importAndSelectJs = fileManager.getFileContent('/renderer/pages-nolayout/', 'import-select.js');

const selectedListId = store.get('list.selected');

async function firstLoad() {
    if (selectedListId) {
        const paged = await Service.loadChannels(selectedListId);
        const html = pageRender.renderPage('home', { layout: 'layout', paginatedData: paged });
        await window.load(html, { type: 'js', data: homejs });
    } else {
        const list = await Service.loadList();
        const html = pageRender.renderPageNoLayout('/renderer/pages-nolayout/', 'import-select', { list: list });

        await window.load(html, { type: 'js', data: importAndSelectJs });
    }
}

setTimeout(() => {
    firstLoad()
        .catch((err) => {
            window.showMsgBox('info', 'Error', '', ['OK'])
            console.debug(err);
        });
}, 3000);


ipcMain.handle("list.load", async (event, search, page, pageSize) => {
    try {
        const paged = await Service.loadChannels(selectedListId, search, page, pageSize);
        const html = pageRender.renderPage('home', { layout: 'layout', paginatedData: paged });
        await window.load(html, { type: 'js', data: homejs });

        //return { status: "success", result: "List data loaded" };
    } catch (err) {
        console.log(err.message);
        //return { status: "success", result: err.message };
    }
});

ipcMain.handle("channel.get", async (event, id, search, page, pageSize) => {
    try {
        const channel = await Service.getChannel(id);
        const paged = await Service.loadChannels(selectedListId, search, page, pageSize);
        const html = pageRender.renderPage('play', { layout: 'layout', paginatedData: paged, item: channel, search });
        await window.load(html, { type: 'js', data: playjs });

        //return { status: "success", result: `Channel data for ID: ${id}` };
    } catch (err) {
        //return { status: "success", result: err.message };
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