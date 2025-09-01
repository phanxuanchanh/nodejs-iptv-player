const { app, BrowserWindow, ipcMain } = require("electron");
const os = require("os");
const fs = require("fs");
const hbs = require("hbs");
const path = require("path");
const { loadList, getChannel } = require("./serivce.js");
const helpers = require('./shared/handlebars-helper.js');

const appDir = app.getAppPath();

for (const [name, fn] of Object.entries(helpers)) {
    hbs.registerHelper(name, fn);
}

function initWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    return win;
}

function renderPage(pageName, data) {
    const layout = fs.readFileSync(path.join(appDir, "renderer/layouts/layout.hbs"), "utf-8");
    const page = fs.readFileSync(path.join(appDir, `renderer/pages/${pageName}.hbs`), "utf-8");
    const compiledLayout = hbs.compile(layout);
    const compiledPage = hbs.compile(page);

    // chèn nội dung trang con vào {{{body}}}
    return compiledLayout({ ...data, body: compiledPage(data) });
}

const tempDir = path.join(os.tmpdir(), app.getName());

function saveHtmlToTemp(pageName, html) {
    if (!fs.existsSync(tempDir))
        fs.mkdirSync(tempDir, { recursive: true });

    const outPath = path.join(tempDir, `${pageName}.html`);
    fs.writeFileSync(outPath, html, "utf-8");

    return outPath;
}

function getAssetContent(assetName) {
    const assetContent = fs.readFileSync(path.join(appDir, `renderer\\${assetName}`), "utf-8");
    return assetContent;
}

let win = null;
app.whenReady().then(() => { win = initWindow(); });

const homejs = getAssetContent('pages/home.js');
const bootstrapcss = getAssetContent('bootstrap.min.css');
const css = getAssetContent('styles.css');
const bootstrapjs = getAssetContent('bootstrap.bundle.min.js');
const layoutJs = getAssetContent('layouts/layout.js');
const playjs = getAssetContent('pages/play.js');

async function loadWindow(win, html, ...assetContents) {
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

    win.webContents.on('did-finish-load', async () => {
        await win.webContents.insertCSS(bootstrapcss);
        await win.webContents.insertCSS(css);
        await win.webContents.executeJavaScript(bootstrapjs);
        await win.webContents.executeJavaScript(layoutJs);

        for (const content of assetContents) {
            if (content.type === 'js')
                await win.webContents.executeJavaScript(content.data);
            else
                await win.webContents.insertCSS(content.data);
        }

        await win.webContents.executeJavaScript('document.documentElement.style.visibility = "visible"');
    });
}

loadList().then((res) => {
    const html = renderPage('home', { layout: 'layout', paginatedData: res });
    loadWindow(win, html, { type: 'js', data: homejs })
        .then(() => { })
        .catch((err) => { });
});

ipcMain.handle("list.load", (event, search, page, pageSize) => {
    loadList(search, page, pageSize).then((res) => {
        const html = renderPage('home', { layout: 'layout', paginatedData: res });
        loadWindow(win, html, { type: 'js', data: homejs })
            .then(() => { })
            .catch((err) => { });
    }).catch((err) => { });

    return { status: "success", result: "List data loaded" };
});

ipcMain.handle("channel.get", (event, id, search, page, pageSize) => {
    getChannel(id).then((res) => {
        loadList(search, page, pageSize).then((listRes) => {
            const html = renderPage('play', { layout: 'layout', paginatedData: listRes, item: res, search });
            loadWindow(win, html, { type: 'js', data: playjs })
                .then(() => { })
                .catch((err) => { });
        }).catch((err) => { console.error('Error loading list:', err) });
    }).catch((err) => { console.error('Error loading channel:', err); });

    return { status: "success", result: `Channel data for ID: ${id}` };
});