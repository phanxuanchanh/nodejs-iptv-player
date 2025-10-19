const { getChannelsFromM3U8 } = require('../shared/m3u8-list-handler.js');
const SqliteExecution = require('../shared/sqlite.js');

/**
 * 
 */
class Service {
    /**
     * Get list of playlists
     * Lấy danh sách phát
     * @returns {Promise<{id: int, name: string, urlOrFileName: string, createdAt: Date}[]>}
     */
    static async getPlaylists() {
        const query = 'SELECT * FROM all_lists';
        return await SqliteExecution.getMany(query);
    }

    /**
     * Get list of channels
     * Lấy danh sách kênh
     * @param {int} listId 
     * @param {boolean} favorited
     * @param {string} search 
     * @param {int} page 
     * @param {int} pageSize 
     * @returns {Promise<{
     *  favorited: boolean, searchKeyword: string, selectedCategory: string, page: int, pageSize: int, items: {
     *      id: int, name: string, logo: string, group: string, url: string, list_id: int, favorited: 0|1
     *  }[]}>}
     */
    static async getChannels(listId, showFavoriteList = false, category = 'all', search = null, page = 1, pageSize = 24) {
        let where = '';
        let whereParams = [];

        where += showFavoriteList ? 'favorited = 1' : '';

        if(search){
            if(where == '')
                where += '(name LIKE ? OR "group" LIKE ?)';
            else
                where += ' AND (name LIKE ? OR "group" LIKE ?)';

            whereParams.push(`%${search}%`, `%${search}%`);
        }

        if(where == '')
            where += ' list_id = ?';
        else
            where += ' AND list_id = ?';

        whereParams.push(listId);

        if(category && category.toLowerCase() !== 'all') {
            where += ' AND "group" LIKE ?';
            whereParams.push(`%${category}%`);
        }

        let paginatedData = await SqliteExecution.getPaginatedData2('all_channels', where, whereParams, page || 1, pageSize || 16);
        paginatedData.favorited = showFavoriteList;
        paginatedData.searchKeyword = search;
        paginatedData.selectedCategory = category;

        return paginatedData;
    }

    /**
     * Get channel by ID
     * Lấy kênh theo ID
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
     * Set favorite status for a channel
     * Đặt trạng thái yêu thích cho một kênh
     * @param {int} id 
     * @param {boolean} isFavorite 
     */
    static async setFavoriteChannel(id, isFavorite) {
        const query = 'UPDATE all_channels SET favorited = ? WHERE id = ?';
        await SqliteExecution.run(query, [isFavorite ? 1 : 0, id]);
    }

    /**
     * Add new playlist
     * Thêm danh sách phát mới
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
     * Get list of channel categories
     * Lấy danh sách thể loại kênh
     * @returns {Promise<{categoryName: string}[]>}
     */
    static async getCategories() {
        const query = 'SELECT DISTINCT "group"  as categoryName FROM all_channels';
        const rawCategories = await SqliteExecution.getMany(query);

        const categories = [];
        for(let rawCategory of rawCategories) {
            rawCategory.categoryName.split(';').forEach(cat => {
                const trimmedCat = cat.trim();
                if (trimmedCat.length > 0 && !categories.includes(trimmedCat)) {
                    categories.push({ categoryName: trimmedCat });
                }
            });
        };

        return categories
    }
}

module.exports = Service;
