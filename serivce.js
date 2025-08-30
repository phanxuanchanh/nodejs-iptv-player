const { getChannelsFromM3U8 } = require('./shared/m3u8-list-handler.js');
const { get, getPaginatedData1, getPaginatedData2, bulkInsert } = require('./shared/sqlite.js');

module.exports = { loadList, getChannel };

async function loadList(search = null, page = 1, pageSize = 16) {
    let paginatedData = null;
    if (search) {
        const where = 'name LIKE ? OR "group" LIKE ?';
        const whereParams = [`%${search}%`, `%${search}%`];
        paginatedData = await getPaginatedData2('all_channels', where, whereParams, page || 1, pageSize || 16);
    } else {
        paginatedData = await getPaginatedData1('all_channels', page || 1, pageSize || 16);
    }

    return paginatedData;
}

async function getChannel(id) {
    if (id === undefined || id == null || id == 0)
        throw new Error('Invalid channel ID');

    const query = 'SELECT * FROM all_channels WHERE id = ?';
    const item = await get(query, [id]);

    return item;
}