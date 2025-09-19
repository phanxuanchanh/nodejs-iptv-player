const Service = require("./serivce.js");
const PageRender = require("../shared/page-render.js");
const FileManager = require("../shared/file.js");
const History = require('./history.js');
const Window = require('./windows.js');
const path = require("path");

/**
 * 
 */
class Handler {
    /**
     * 
     * @param {{appPath: string, tempPath: string}} paths
     * @param {Window} window 
     * @param {PageRender} pageRender
     * @param {FileManager} fileManager
     * @param {History} history
     * @param {{id: int, name: string, urlOrFileName: string, createdAt: Date}[]} playlists
     * @param {{ categoryName: string}[]} categories
     */
    constructor(paths, window, pageRender, fileManager, history, playlists, categories) {
        this.paths = paths;
        this.window = window;
        this.pageRender = pageRender;
        this.fileManager = fileManager;
        this.history = history;
        this.playlists = playlists;
        this.categories = categories;
    }

    /**
     * 
     * @param {{appPath: string, tempPath: string}} paths
     * @param {Window} window 
     * @param {PageRender} pageRender 
     * @param {FileManager} fileManager 
     * @param {History} history
     * @returns {Handler}
     */
    static Init(paths, window, pageRender, fileManager, history) {
        const handler = new Handler(paths, window, pageRender, fileManager, history, []);
        Promise.all([Service.loadPlaylists(), Service.loadCategories()])
            .then((res) => {
                handler.playlists = res[0];
                handler.categories = res[1];
            }).catch((err) => { throw err; });

        return handler;
    }

    /**
     * 
     * @param {int} selectedListId 
     * @param {string} search 
     * @param {int} page 
     * @param {intint} pageSize 
     */
    async loadChannels(selectedListId, search = null, page = 1, pageSize = 24) {
        const paged = await Service.loadChannels(selectedListId, search, page, pageSize);
        const html = this.pageRender.renderPage('home', {
            layout: 'layout',
            paginatedData: paged,
            playlists: this.playlists,
            categories: this.categories,
            selectedPlaylistId: selectedListId,
            enableBackBtn: false
        });
        await this.window.load(html);
        this.history.pushListPage(selectedListId, search, page, pageSize);
    }

    /**
     * 
     * @param {int} selectedListId 
     * @param {int} id 
     * @param {string} search 
     * @param {int} page 
     * @param {int} pageSize 
     */
    async loadChannel(selectedListId, id, search = null, page = 1, pageSize = 24) {
        const channel = await Service.getChannel(id);
        const paged = await Service.loadChannels(selectedListId, search, page, pageSize);
        const html = this.pageRender.renderPage('play', {
            layout: 'layout',
            paginatedData: paged,
            item: channel,
            search,
            playlists: this.playlists,
            categories: this.categories,
            selectedPlaylistId: selectedListId,
            enableBackBtn: true
        });

        const videoJsCssPath = path.join(this.paths.tempPath, 'video-js', 'video-js.min.css')
            .replace(/\\/g, '/');
        const videoJsJsPath = path.join(this.paths.tempPath, 'video-js', 'video.min.js')
            .replace(/\\/g, '/');
        const videoJsHttpStreamingJsPath = path.join(this.paths.tempPath, 'videojs-http-streaming', 'videojs-http-streaming.min.js')
            .replace(/\\/g, '/');
        const videoJsQualitySelectorJsPath = path.join(this.paths.tempPath, 'videojs-hls-quality-selector', 'videojs-hls-quality-selector.min.js')
            .replace(/\\/g, '/');
        const playJs = this.fileManager.getFileContent('/renderer/js/', 'play.js');
        const tempLoaderJs = this.fileManager.getFileContent('/renderer/js/', 'temp-loader.js')
            .replace('<<VIDEOJS-CSSPATH>>', videoJsCssPath)
            .replace('<<VIDEOJS-JSPATH>>', videoJsJsPath)
            .replace('<<VIDEOJS-HTTP-STREAMING-JSPATH>>', videoJsHttpStreamingJsPath)
            .replace('<<VIDEOJS-QUALITY-SELECTOR-JSPATH>>', videoJsQualitySelectorJsPath)
            .replace('<<PLAY-JSCONTENT>>', playJs);

        await this.window.load(html, { type: 'js', data: tempLoaderJs });
    }

    /**
     * 
     * @param {int} id
     * @param {boolean} isFavorite
     * @returns {Promise<{status: string, message: string}>}
     */
    async setFavoriteChannel(id, isFavorite) {
        if (id === undefined || id == null || id == 0)
            return { status: 'invalid', message: 'Invalid channel ID'};

        await Service.setFavoriteChannel(id, isFavorite);
        return { status: 'success', message: '' };
    }

    /**
     * 
     */
    async loadAbout() {
        const html = this.pageRender.renderPage('about', {
            layout: 'layout',
            playlists: this.playlists,
            categories: this.categories,
            enableBackBtn: false
        });
        const aboutJs = this.fileManager.getFileContent('/renderer/js/', 'about.js');

        await this.window.load(html, { type: 'js', data: aboutJs });
    }

    /**
     * 
     */
    async loadImportAndSelectPlaylist() {
        const importAndSelectJs = this.fileManager.getFileContent('/renderer/pages-nolayout/', 'import-select.js');
        const html = this.pageRender.renderPageNoLayout('/renderer/pages-nolayout/', 'import-select', { playlists: this.playlists });
        await this.window.load(html, { type: 'js', data: importAndSelectJs });
    }
}

module.exports = Handler;