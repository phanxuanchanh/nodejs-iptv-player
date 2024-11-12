import sqlite3 from 'sqlite3';

let db;

export async function openDatabase() {
    db = new sqlite3.Database('./db/app.db', (err) => {
        if (err) {
            console.log('Lỗi khi mở kết nối cơ sở dữ liệu:', err.message);
        } else {
            console.log('Database connected');
        }
    });
}

export async function closeDatabase() {
    try {
        await db.close();
        //console.log('Database connection closed');
    } catch (error) {
        //console.error('Error closing the database', error);
    }
}

export async function get(query, params = []) {
    return await new Promise((resolve, reject) => { 
        db.get(query, params, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

export async function getPaginatedData(table, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const paginatedQuery = `SELECT * FROM ${table} LIMIT ? OFFSET ?`;
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

export async function insert(query, params = []) {
    const { lastID } = await db.run(query, params);
    return { id: lastID };
}

export async function bulkInsert(query, data) {
    try {
        const stmt = await db.prepare(query);
        await stmt.run(...data.map(row => stmt.run(...row)));
        await stmt.finalize();
        return { rows: data.length };
    } catch (error) {
        return { rows: 0, msg: error.message };
    }
}

await openDatabase();
await db.run('CREATE TABLE IF NOT EXISTS all_channels (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, logo TEXT, "group" TEXT, url TEXT)');