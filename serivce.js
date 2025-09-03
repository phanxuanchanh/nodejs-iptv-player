const { getChannelsFromM3U8 } = require('./shared/m3u8-list-handler.js');
const { SqliteExecution } = require('./shared/sqlite.js');

class Service {
    static async loadList(search = null, page = 1, pageSize = 24) {
        let paginatedData = null;
        if (search) {
            const where = 'name LIKE ? OR "group" LIKE ?';
            const whereParams = [`%${search}%`, `%${search}%`];
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
        const channels = await getChannelsFromM3U8(url);
        const query = 'INSERT INTO all_channels (name, logo, "group", url) VALUES (?, ?, ?, ?)';
        const data = [];

        channels.forEach(channel => {
            data.push([channel.name, channel.logo, channel.group, channel.url]);
        })


        console.log(data);
        const qres = await SqliteExecution.bulkInsert(query, data);
    }
}

module.exports = Service;
