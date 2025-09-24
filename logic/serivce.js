const { getChannelsFromM3U8 } = require('../shared/m3u8-list-handler.js');
const SqliteExecution = require('../shared/sqlite.js');

/**
 * 
 */
class Service {
    /**
     * 
     * @returns {Promise<{id: int, name: string, urlOrFileName: string, createdAt: Date}[]>}
     */
    static async getPlaylists() {
        const query = 'SELECT * FROM all_lists';
        return await SqliteExecution.getMany(query);
    }

    /**
     * 
     * @param {int} listId 
     * @param {boolean} favorited
     * @param {string} search 
     * @param {int} page 
     * @param {int} pageSize 
     * @returns {Promise<{
     *  favorited: boolean, searchKeyword: string, page: int, pageSize: int, items: {
     *      id: int, name: string, logo: string, group: string, url: string, list_id: int, favorited: 0|1
     *  }[]}>}
     */
    static async getChannels(listId, showFavoriteList = false, search = null, page = 1, pageSize = 24) {
        let where = null;
        let whereParams = null;
        let showFavoriteListInt = showFavoriteList ? 1 : 0;
        if (showFavoriteListInt === 1) {
            if (search) {
                where = '(name LIKE ? OR "group" LIKE ?) AND list_id = ? AND favorited = 1';
                whereParams = [`%${search}%`, `%${search}%`, listId];
            } else {
                where = 'list_id = ? AND favorited = 1';
                whereParams = [listId];
            }
        } else {
            if (search) {
                where = '(name LIKE ? OR "group" LIKE ?) AND list_id = ?';
                whereParams = [`%${search}%`, `%${search}%`, listId];
            } else {
                where = 'list_id = ?';
                whereParams = [listId];
            }
        }

        let paginatedData = await SqliteExecution.getPaginatedData2('all_channels', where, whereParams, page || 1, pageSize || 16);
        paginatedData.favorited = showFavoriteList;
        paginatedData.searchKeyword = search;

        return paginatedData;
    }

    /**
     * 
     * @param {int} id 
     * @returns {{id: int, name: string, logo: string, group: string, url: string, list_id: int, favorited: 0|1}}
     */
    static async getChannel(id) {
        if (id === undefined || id == null || id == 0)
            throw new Error('Invalid channel ID');

        const query = 'SELECT * FROM all_channels WHERE id = ?';
        const item = await SqliteExecution.get(query, [id]);

        return item;
    }

    /**
     * 
     * @param {int} id 
     * @param {boolean} isFavorite 
     */
    static async setFavoriteChannel(id, isFavorite) {
        const query = 'UPDATE all_channels SET favorited = ? WHERE id = ?';
        await SqliteExecution.run(query, [isFavorite ? 1 : 0, id]);
    }

    /**
     * 
     * @param {string} name 
     * @param {string} url 
     */
    static async addPlaylist(name, url) {
        try {
            await SqliteExecution.run('BEGIN TRANSACTION');

            const addListTableQuery = 'INSERT INTO all_lists (name, urlOrFileName) VALUES (?, ?)'
            const itemData = [name, url];
            const res = await SqliteExecution.insert(addListTableQuery, itemData);

            const channels = await getChannelsFromM3U8(url);
            const addChannelsQuery = 'INSERT INTO all_channels (name, logo, "group", url, list_id) VALUES (?, ?, ?, ?, ?)';
            const channelItems = [];

            channels.forEach(channel => {
                channelItems.push([channel.name, channel.logo, channel.group, channel.url, res.lastID]);
            });

            await SqliteExecution.bulkInsert(addChannelsQuery, channelItems, { useTransaction: false });
            await SqliteExecution.run('COMMIT');
        } catch (e) {
            await SqliteExecution.run('ROLLBACK');
            throw e;
        }
    }

    /**
     * 
     * @returns {Promise<{categoryName: string}[]>}
     */
    static async loadCategories() {
        const query = 'SELECT DISTINCT "group"  as categoryName FROM all_channels';
        return await SqliteExecution.getMany(query);
    }
}

module.exports = Service;
