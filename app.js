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

const assetsPath = path.join(appDir, 'renderer');
console.log('Assets Path:', assetsPath); console.log('Dirname:', path.join(__dirname, "preload.js"));

function renderPage(pageName, data) {
    const layout = fs.readFileSync(path.join(appDir, "renderer/layouts/layout.hbs"), "utf-8");
    const page = fs.readFileSync(path.join(appDir, `renderer/pages/${pageName}.hbs`), "utf-8");
    const compiledLayout = hbs.compile(layout);
    const compiledPage = hbs.compile(page);

    // chèn nội dung trang con vào {{{body}}}
    return compiledLayout({ ...data, body: compiledPage(data), assetsPath });
}

const tempDir = path.join(os.tmpdir(), app.getName());

function saveHtmlToTemp(pageName, html) {
    if (!fs.existsSync(tempDir))
        fs.mkdirSync(tempDir, { recursive: true });

    const outPath = path.join(tempDir, `${pageName}.html`);
    fs.writeFileSync(outPath, html, "utf-8");

    return outPath;
}

let win = null;
app.whenReady().then(() => { win = initWindow(''); });

loadList().then((res) => {
    const html = renderPage('home', { layout: 'layout', paginatedData: res, assetsPath });
    const outPath = saveHtmlToTemp('home', html);
    win?.loadFile(outPath);
});

ipcMain.handle("list.load", async (event, search, page, pageSize) => {
    loadList(search, page, pageSize).then((res) => {
        const html = renderPage('home', { layout: 'layout', paginatedData: res, assetsPath });
        const outPath = saveHtmlToTemp(`home_${page}-${pageSize}-${search}`, html);
        win?.loadFile(outPath);
    }).catch((err) => { });
});

ipcMain.handle("channel.get", async (event, id, search, page, pageSize) => { console.log(id);
    getChannel(id).then((res) => {
        loadList(search, page, pageSize).then((listRes) => {
            const html = renderPage('play', { layout: 'layout', paginatedData: listRes, item: res, assetsPath, search });
            const outPath = saveHtmlToTemp(`play${id}-${page}-${pageSize}-${search}`, html);
            win?.loadFile(outPath);

            console.log('Loaded channel page for ID:', id);
        });
    }).catch((err) => {
        console.error('Error loading channel:', err);
    });

    return { status: "success", result: `Channel data for ID: ${id}` };
});