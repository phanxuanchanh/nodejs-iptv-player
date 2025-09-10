const { BrowserWindow } = require("electron");
const Service = require("./serivce.js");
const PageRender = require("./shared/page-render");
const FileManager = require("./shared/file.js");

class Handler {
    /**
     * 
     * @param {BrowserWindow} window 
     * @param {PageRender} pageRender
     * @param {FileManager} fileManager
     * @param {[]} playlists 
     */
    constructor(window, pageRender, fileManager, playlists) {
        this.window = window;
        this.pageRender = pageRender;
        this.fileManager = fileManager;
        this.playlists = playlists;
    }

    /**
     * 
     * @param {BrowserWindow} window 
     * @param {PageRender} pageRender 
     * @param {FileManager} fileManager 
     * @returns {Handler}
     */
    static Init(window, pageRender, fileManager) {
        const handler = new Handler(window, pageRender, fileManager, []);

        Service.loadPlaylists().then((rows) => {
            handler.playlists = rows
        }).catch((err) => { throw err; });

        return handler;
    }

    async loadChannels(selectedListId, search = null, page = 1, pageSize = 24) {
        const paged = await Service.loadChannels(selectedListId, search, page, pageSize);
        const html = this.pageRender.renderPage('home', {
            layout: 'layout',
            paginatedData: paged,
            playlists: this.playlists,
            enableBackBtn: false
        });
        await this.window.load(html);
    }

    async loadChannel(selectedListId, id, search = null, page = 1, pageSize = 24) {
        const channel = await Service.getChannel(id);
        const paged = await Service.loadChannels(selectedListId, search, page, pageSize);
        const html = this.pageRender.renderPage('play', {
            layout: 'layout',
            paginatedData: paged, 
            item: channel, 
            search, 
            playlists: this.playlists,
            enableBackBtn: true
        });
        await this.window.load(html);
    }

    async loadAbout() {
        const html = this.pageRender.renderPage('about', { 
            layout: 'layout', 
            playlists: this.playlists,
            enableBackBtn: false
        });
        await this.window.load(html);
    }

    async loadImportAndSelectPlaylist() {
        const importAndSelectJs = this.fileManager.getFileContent('/renderer/pages-nolayout/', 'import-select.js');
        const html = this.pageRender.renderPageNoLayout('/renderer/pages-nolayout/', 'import-select', { playlists: this.playlists });
        await this.window.load(html, { type: 'js', data: importAndSelectJs });
    }
}

module.exports = Handler;