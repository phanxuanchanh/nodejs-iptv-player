const { app, ipcMain } = require("electron");
const os = require("os");
const path = require("path");
const Window = require('./windows.js');
const PageRender = require('./shared/page-render.js');
const { SqliteExecution, initTables } = require('./shared/sqlite.js');
const FileManager = require('./shared/file.js');
const Service = require("./serivce.js");

const appPath = app.getAppPath();
const tempPath = path.join(os.tmpdir(), app.getName());
const pageRender = new PageRender(appPath);
const window = new Window(appPath);
const fileManager = new FileManager(appPath);

pageRender.setHelpers();
app.whenReady().then(() => { window.init(); });
FileManager.createDir(tempPath);

SqliteExecution.openDatabase(`${tempPath}\\app.db`)
    .then(() => {
        initTables().then(() => { console.debug('Tables created'); });
    });

setTimeout(() => {
    Service.loadList().then((res) => {
        const html = pageRender.renderPage('home', { layout: 'layout', paginatedData: res });
        window.load(html, { type: 'js', data: homejs })
            .catch((err) => {
                console.debug(err);

                window.showMsgBox('info', 'Lỗi', err.message, ['OK'])
                .catch((msgBoxErr) => { console.debug(msgBoxErr) })
            });
    });
}, 3000);

const homejs = fileManager.getAssetContent('pages/home.js');
const playjs = fileManager.getAssetContent('pages/play.js');

ipcMain.handle("list.load", async (event, search, page, pageSize) => {
    try {
        const paged = await Service.loadList(search, page, pageSize);
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
        const paged = await Service.loadList(search, page, pageSize);
        const html = pageRender.renderPage('play', { layout: 'layout', paginatedData: paged, item: channel, search });
        await window.load(html, { type: 'js', data: playjs });

        //return { status: "success", result: `Channel data for ID: ${id}` };
    } catch (err) {
        //return { status: "success", result: err.message };
    }
});

ipcMain.handle('add.m3u8.link', async (event, url) => {
    if(url === null || url === undefined || url === '')
        window.showMsgBox('info', 'Invalid data', 'URL cannot be null, empty, or undefined', ['OK'])

    await Service.addFromUrl(url);

    console.log('Imported');
});