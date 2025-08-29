const sqlite3 = require('sqlite3').verbose();

module.exports = { openDatabase, closeDatabase, get, insert, bulkInsert, getPaginatedData1, getPaginatedData2 };

let db;

async function openDatabase() {
    db = new sqlite3.Database('./db/app.db', (err) => {
        if (err) {
            console.log('Lỗi khi mở kết nối cơ sở dữ liệu:', err.message);
        } else {
            console.log('Database connected');
        }
    });
}

async function closeDatabase() {
    try {
        await db.close();
        //console.log('Database connection closed');
    } catch (error) {
        //console.error('Error closing the database', error);
    }
}

async function get(query, params = []) {
    return await new Promise((resolve, reject) => {
        db.get(query, params, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

async function getPaginatedData1(tableName, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const paginatedQuery = `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`;
    const items = await new Promise((resolve, reject) => {
        db.all(paginatedQuery, [pageSize, offset], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });

    return {
        page: page,
        pageSize: pageSize,
        items: items
    }
}

async function getPaginatedData2(tableName, where, whereParams, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const paginatedQuery = `SELECT * FROM ${tableName} WHERE ${where} LIMIT ? OFFSET ?`;
    const items = await new Promise((resolve, reject) => {
        db.all(paginatedQuery, [...whereParams, pageSize, offset], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });

    return {
        page: page,
        pageSize: pageSize,
        items: items
    }
}

async function insert(query, params = []) {
    const { lastID } = await db.run(query, params);
    return { id: lastID };
}

async function bulkInsert(query, data) {
    try {
        const stmt = await db.prepare(query);
        await stmt.run(...data.map(row => stmt.run(...row)));
        await stmt.finalize();
        return { rows: data.length };
    } catch (error) {
        return { rows: 0, msg: error.message };
    }
}

openDatabase().then(() => { console.log('Database opened'); });
db.run('CREATE TABLE IF NOT EXISTS all_channels (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, logo TEXT, "group" TEXT, url TEXT)');