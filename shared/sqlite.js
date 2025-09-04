const { rejects } = require('assert');
const { resolve } = require('path');

const sqlite3 = require('sqlite3').verbose();

class SqliteExecution {
    static db;

    static async openDatabase(path) {
        SqliteExecution.db = new sqlite3.Database(path, (err) => {
            if (err) {
                console.log('Lỗi khi mở kết nối cơ sở dữ liệu:', err.message);
            } else {
                console.log('Database connected');
            }
        });
    }

    static async closeDatabase() {
        await SqliteExecution.db.close();
    }

    static async get(query, params = []) {
        return await new Promise((resolve, reject) => {
            SqliteExecution.db.get(query, params, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }

    static async getMany(query) {
        return await new Promise((resolve, reject) => {
            SqliteExecution.db.all(query, [], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }

    static async getPaginatedData1(tableName, page = 1, pageSize = 10) {
        const offset = (page - 1) * pageSize;
        const paginatedQuery = `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`;
        const items = await new Promise((resolve, reject) => {
            SqliteExecution.db.all(paginatedQuery, [pageSize, offset], (err, rows) => {
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

    static async getPaginatedData2(tableName, where, whereParams, page = 1, pageSize = 10) {
        const offset = (page - 1) * pageSize;
        const paginatedQuery = `SELECT * FROM ${tableName} WHERE ${where} LIMIT ? OFFSET ?`;
        const items = await new Promise((resolve, reject) => {
            SqliteExecution.db.all(paginatedQuery, [...whereParams, pageSize, offset], (err, rows) => {
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

    static async insert(query, params = []) {
        return new Promise((resolve, reject) => {
            SqliteExecution.db.run(query, params, function (err) {
                if (err) 
                    return reject(err);

                resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    static async bulkInsert(query, data) {
        const stmt = await SqliteExecution.db.prepare(query);
        await stmt.run(...data.map(row => stmt.run(...row)));
        await stmt.finalize();
        return { rows: data.length };
    }
}

module.exports = SqliteExecution;