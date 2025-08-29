const { getChannelsFromM3U8 } = require('./shared/m3u8-list-handler.js');
const { get, getPaginatedData1, getPaginatedData2, bulkInsert } = require('./shared/sqlite.js');

module.exports = { loadList };

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