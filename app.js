const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const hbs = require("hbs");
const path = require("path");
const { loadList } = require("./serivce.js");
const helpers = require('./shared/handlebars-helper.js');

const appDir = app.getAppPath();

for (const [name, fn] of Object.entries(helpers)) {
    hbs.registerHelper(name, fn);
}

function initWindow(html) {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win.loadURL("data:text/html," + encodeURIComponent(html));
}

function renderPage(pageName, data) {
    const layout = fs.readFileSync(path.join(appDir, "renderer/layouts/layout.hbs"), "utf-8");
    const page = fs.readFileSync(path.join(appDir, `renderer/pages/${pageName}.hbs`), "utf-8");
    const compiledLayout = hbs.compile(layout);
    const compiledPage = hbs.compile(page);

    const assetsPath = `file://${path.join(appDir, 'renderer')}`;

    // chèn nội dung trang con vào {{{body}}}
    return compiledLayout({ ...data, body: compiledPage(data), assetsPath });
}

loadList().then((res) => {
    const html = renderPage('home', { layout: 'layout', paginatedData: res });
    app.whenReady().then(() => { initWindow(html); });
});

ipcMain.handle("channel.get", async (event, id) => {
  console.log("Fetching channel with ID:", id);  
});