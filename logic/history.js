
/**
 * A class to manage navigation history
 * | Một lớp để quản lý lịch sử điều hướng
 * @class History
 */
class History {
    /**
     * @type {{
     * selectedListId: int,
     * listPage: { showFavoriteList: boolean, categoryName: string, search: string, page: int, pageSize: int },
     * playPage: { channelId: int, search: string, page: int, pageSize: int }
     * }[]}
     */
    #items = [];

    constructor() {
        this.#items = [];
    }

    /**
     * 
     * @param {{showFavoriteList: boolean, categoryName: string, search: string, page: int, pageSize: int}} pageParams 
     * @returns {boolean}
     */
    #checkListPageExist(pageParams) {
        return this.#items.some(
            p => p.selectedListId === pageParams.selectedListId
                && p.listPage.showFavoriteList === pageParams.showFavoriteList
                && p.listPage.categoryName === pageParams.categoryName
                && p.listPage.search === pageParams.search
                && p.listPage.page === pageParams.page
                && p.listPage.pageSize === pageParams.pageSize
        );
    }

    /**
     * 
     * @param {{channelId: int, search: string, page: int, pageSize: int}} pageParams 
     * @returns {boolean}
     */
    #checkPlayPageExist(pageParams) {
        return this.#items.some(
            p => p.selectedListId === pageParams.selectedListId
                && p.playPage.channelId === pageParams.channelId
                && p.playPage.search === pageParams.search
                && p.playPage.page === pageParams.page
                && p.playPage.pageSize === pageParams.pageSize
        );
    }

    /**
     * 
     * @param {{showFavoriteList: boolean, categoryName: string, search: string, page: int, pageSize: int} 
     * | {channelId: int, search: string, page: int, pageSize: int}} pageParams 
     */
    push(selectedListId, pageParams, isListPage = true) {
        let item = {
            selectedListId,
            listPage: null,
            playPage: null
        };

        if (isListPage)
            item.listPage = pageParams;
        else
            item.playPage = pageParams;

        if (isListPage) {
            if (this.#checkListPageExist(pageParams))
                return;

            this.#items.push(item);
            return;
        }

        if(this.#checkPlayPageExist(pageParams))
            return;

        this.#items.push(item);
    }

    /**
     * 
     * @returns {{
     * selectedListId: int,
     * listPage: { showFavoriteList: boolean, categoryName: string, search: string, page: int, pageSize: int },
     * playPage: { channelId: int, search: string, page: int, pageSize: int }
     * }[]}
     */
    pop(){
        return this.#items.pop();
    }
}

module.exports = History;