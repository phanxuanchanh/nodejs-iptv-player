
class History {
    /**
     * @type {{page: int, pageSize: int, search: string}[]}
     */
    #listPages;

    constructor(){ 
        this.#listPages = [];
    }

    /**
     * 
     * @param {int} selectedListId
     * @param {string} search
     * @param {int} page
     * @param {int} pageSize
     */
    pushListPage(selectedListId, search, page, pageSize){
        this.#listPages.push({ selectedListId, search, page, pageSize })
    }

    /**
     * @returns {{page: int, pageSize: int, search: string}}
     */
    popListPage(){
        return this.#listPages.pop();
    }
}

module.exports = History;