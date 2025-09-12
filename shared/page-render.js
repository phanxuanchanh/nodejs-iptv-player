const fs = require("fs");
const hbs = require("hbs");
const path = require("path");
const helpers = require('./handlebars-helper.js');

/**
 * 
 */
class PageRender {
    /**
     * 
     * @param {string} appPath 
     */
    constructor(appPath) {
        this.appPath = appPath;
    }

    setHelpers() {
        for (const [name, fn] of Object.entries(helpers)) {
            hbs.registerHelper(name, fn);
        }
    }

    /**
     * 
     * @param {string} pageName 
     * @param {any} data 
     * @returns {string}
     */
    renderPage(pageName, data) {
        const layout = fs.readFileSync(path.join(this.appPath, "renderer/layouts/layout.hbs"), "utf-8");
        const page = fs.readFileSync(path.join(this.appPath, `renderer/pages/${pageName}.hbs`), "utf-8");
        const compiledLayout = hbs.compile(layout);
        const compiledPage = hbs.compile(page);

        return compiledLayout({ ...data, body: compiledPage(data) });
    }

    /**
     * 
     * @param {string} path 
     * @param {string} pageName 
     * @param {any} data 
     * @returns {string}
     */
    renderPageNoLayout(path, pageName, data = {}) {
        const filePath = `${this.appPath}${path}${pageName}.hbs`;
        const page = fs.readFileSync(filePath, 'utf-8')

        data.layout = null;
        const compiledPage = hbs.compile(page);

        return compiledPage(data);
    }
}

module.exports = PageRender;


