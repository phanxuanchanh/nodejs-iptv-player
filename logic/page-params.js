/**
 * @class PageParams
 */
class PageParams {
    /**
     * 
     * @param {{selectedListId: int, listPage: any, playPage: any}} 
     * @returns {string}
     */
    static buildAndEncode(pageParams) {
        const jsonString = JSON.stringify(pageParams);
        return Buffer.from(jsonString).toString('base64');
    }

    /**
     * 
     * @param {string} pageParamsString 
     * @returns {any}
     */
    static decodeAndGet(pageParamsString){
        const jsonString = Buffer.from(pageParamsString, 'base64').toString('utf8');
        return JSON.parse(jsonString);
    }
}

module.exports = PageParams;