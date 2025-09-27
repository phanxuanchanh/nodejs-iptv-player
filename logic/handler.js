const Service = require("./serivce.js");
const PageRender = require("../shared/page-render.js");
const FileManager = require("../shared/file.js");
const Window = require('./windows.js');
const path = require("path");
const Consts = require("./../consts.js");
const PageParams = require("./page-params.js");

/**
 * Handle requests from renderer process
 * | Xử lý các yêu cầu từ renderer process
 * @class Handler
 */
class Handler {
    /**
     * @type {{selectedPlaylistId: int, selectedLanguage: int}}
     */
    #config;

    /**
     * 
     * @param {{appPath: string, tempPath: string}} paths
     * @param {Window} window 
     * @param {PageRender} pageRender
     * @param {FileManager} fileManager
     * @param {{id: int, name: string, urlOrFileName: string, createdAt: Date}[]} playlists
     * @param {{ categoryName: string}[]} categories
     */
    constructor(paths, window, pageRender, fileManager, playlists, categories) {
        this.paths = paths;
        this.window = window;
        this.pageRender = pageRender;
        this.fileManager = fileManager;
        this.playlists = playlists;
        this.categories = categories;

        this.#config = null;
        this.isReady = false;
    }

    /**
     * 
     * @param {{appPath: string, tempPath: string}} paths
     * @param {Window} window 
     * @param {PageRender} pageRender 
     * @param {FileManager} fileManager
     * @returns {Handler}
     */
    static Init(paths, window, pageRender, fileManager) {
        const handler = new Handler(paths, window, pageRender, fileManager, []);
        Promise.all([Service.getPlaylists(), Service.getCategories()])
            .then((res) => {
                handler.playlists = res[0];
                handler.categories = res[1];

                handler.isReady = true;
            }).catch((err) => { throw err; });

        return handler;
    }

    /**
     * 
     * @param {{ selectedPlaylistId: int, selectedLanguage: int}} config 
     */
    setConfig(config) {
        this.#config = config;
    }

    /**
     * 
     * @param {boolean} showFavoriteList
     * @param {string} categoryName
     * @param {string} search 
     * @param {int} page 
     * @param {int} pageSize 
     */
    async loadChannels(showFavoriteList = false, categoryName = 'all', search = null, page = 1, pageSize = 24) {
        if (this.#config === null)
            throw new Error('Config not set');

        const paged = await Service.getChannels(this.#config.selectedPlaylistId, showFavoriteList, categoryName, search, page, pageSize);
        const pageParamsObject = {
            selectedPlaylistId: this.#config.selectedPlaylistId,
            listPage: {
                showFavoriteList,
                categoryName,
                search,
                page,
                pageSize,
            },
            playPage: null
        };
        const pageParamsString = PageParams.buildAndEncode(pageParamsObject);

        const html = this.pageRender.renderPage('home', {
            layout: 'layout',
            paginatedData: paged,
            playlists: this.playlists,
            categories: this.categories,
            selectedPlaylistId: this.#config.selectedPlaylistId,
            selectedLanguage: this.#config.selectedLanguage,
            enableBackBtn: false,
            pageParamsString,
            consts: Consts,
        });
        const homeJs = this.fileManager.getFileContent('/renderer/js/', 'home.js')

        await this.window.load(html, true, { type: 'js', data: homeJs });
    }

    /**
     * 
     * @param {int} id 
     * @param {string} search 
     * @param {int} page 
     * @param {int} pageSize 
     */
    async loadChannel(id, search = null, page = 1, pageSize = 24) {
        const channel = await Service.getChannel(id);
        const paged = await Service.getChannels(this.#config.selectedPlaylistId, false, 'all', search, page, pageSize);
        const pageParamsObject = {
            selectedPlaylistId: this.#config.selectedPlaylistId,
            listPage: null,
            playPage: {
                channelId: id,
                search,
                page,
                pageSize
            }
        };
        const pageParamsString = PageParams.buildAndEncode(pageParamsObject);

        const html = this.pageRender.renderPage('play', {
            layout: 'layout',
            paginatedData: paged,
            item: channel,
            search,
            playlists: this.playlists,
            categories: this.categories,
            selectedPlaylistId: this.#config.selectedPlaylistId,
            selectedLanguage: this.#config.selectedLanguage,
            enableBackBtn: true,
            pageParamsString,
            consts: Consts,
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

        await this.window.load(html, true, { type: 'js', data: tempLoaderJs });
    }

    /**
     * 
     * @param {int} id
     * @param {boolean} isFavorite
     * @returns {Promise<{status: string, message: string}>}
     */
    async setFavoriteChannel(id, isFavorite) {
        if (id === undefined || id == null || id == 0)
            return { status: 'invalid', message: 'Invalid channel ID' };

        await Service.setFavoriteChannel(id, isFavorite);
        return { status: 'success', message: '' };
    }

    /**
     * @returns {Promise<void>}
     */
    async loadAbout() {
        const pageParamsObject = {
            selectedPlaylistId: this.#config.selectedPlaylistId,
            listPage: null,
            playPage: null
        };

        const pageParamsString = PageParams.buildAndEncode(pageParamsObject);

        const html = this.pageRender.renderPage('about', {
            layout: 'layout',
            playlists: this.playlists,
            categories: this.categories,
            selectedPlaylistId: this.#config.selectedPlaylistId,
            selectedLanguage: this.#config.selectedLanguage,
            enableBackBtn: false,
            pageParamsString,
            consts: Consts,
        });
        const aboutJs = this.fileManager.getFileContent('/renderer/js/', 'about.js');

        await this.window.load(html, true, { type: 'js', data: aboutJs });
    }

    /**
     * @returns {Promise<void>}
     */
    async loadImportAndSelectPlaylist() {
        const bootstrapcss = this.fileManager.getFileContent('/renderer/css/', 'bootstrap.min.css');
        const bootstrapjs = this.fileManager.getFileContent('/renderer/js/', 'bootstrap.bundle.min.js');
        const importAndSelectJs = this.fileManager.getFileContent('/renderer/pages-nolayout/', 'import-select.js');

        const html = this.pageRender.renderPageNoLayout('/renderer/pages-nolayout/', 'import-select', { playlists: this.playlists });
        const assetContents = [
            { type: 'css', data: bootstrapcss },
            { type: 'js', data: bootstrapjs },
            { type: 'js', data: importAndSelectJs }
        ];

        await this.window.load(html, false, ...assetContents);
    }
}

module.exports = Handler;