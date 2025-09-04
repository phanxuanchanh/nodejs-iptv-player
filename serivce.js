const { getChannelsFromM3U8 } = require('./shared/m3u8-list-handler.js');
const SqliteExecution = require('./shared/sqlite.js');

class Service {
    static async loadList() {
        const query = 'SELECT * FROM all_lists';
        return await SqliteExecution.getMany(query);
    }

    static async loadChannels(listId, search = null, page = 1, pageSize = 24) {
        let paginatedData = null;
        if (search) {
            const where = '(name LIKE ? OR "group" LIKE ?) AND list_id = ?';
            const whereParams = [`%${search}%`, `%${search}%`, listId];
            paginatedData = await SqliteExecution.getPaginatedData2('all_channels', where, whereParams, page || 1, pageSize || 16);
        } else {
            paginatedData = await SqliteExecution.getPaginatedData1('all_channels', page || 1, pageSize || 16);
        }

        return paginatedData;
    }

    static async getChannel(id) {
        if (id === undefined || id == null || id == 0)
            throw new Error('Invalid channel ID');

        const query = 'SELECT * FROM all_channels WHERE id = ?';
        const item = await SqliteExecution.get(query, [id]);

        return item;
    }

    static async addFromUrl(url) {
        try {
            SqliteExecution.db.run('BEGIN TRANSACTION');

            const addListTableQuery = 'INSERT INTO all_lists (urlOrFileName) VALUES (?)'
            const itemData = [url];
            const res = await SqliteExecution.insert(addListTableQuery, itemData);

            console.log(res.lastID);

            const channels = await getChannelsFromM3U8(url);
            const addChannelsQuery = 'INSERT INTO all_channels (name, logo, "group", url, list_id) VALUES (?, ?, ?, ?, ?)';
            const channelItems = [];

            channels.forEach(channel => {
                channelItems.push([channel.name, channel.logo, channel.group, channel.url, res.lastID]);
            })

            const qres = await SqliteExecution.bulkInsert(addChannelsQuery, channelItems);

            SqliteExecution.db.run('COMMIT');
        } catch (e) {
            SqliteExecution.db.run('ROLLBACK');
            throw e;
        }
    }
}

module.exports = Service;
