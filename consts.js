/**
 * Application constants
 * @class
 */
class Consts {
    /**
     * Supported application languages
     * @returns {{code: string, text: string}[]}
     */
    static get APP_LANGUAGES() {
        return [{ code: 'en', text: 'English'}, { code: 'vi', text: 'Tiếng Việt' }, { code: 'ja', text: '日本語' }];
    }
}

module.exports = Consts;