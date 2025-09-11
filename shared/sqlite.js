const sqlite3 = require('sqlite3').verbose();

class SqliteExecution {
    static db;

    /**
     * 
     * @param {string} path 
     */
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
        return new Promise((resolve, reject) => {
            SqliteExecution.db.close(err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    /**
     * 
     * @param {string} query 
     * @param {any[]} params 
     * @returns {Promise<any>}
     */
    static async get(query, params = []) {
        return await new Promise((resolve, reject) => {
            SqliteExecution.db.get(query, params, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }

    /**
     * 
     * @param {string} query 
     * @param {any[]} params 
     * @returns {Promise<any[]>}
     */
    static async getMany(query, params = []) {
        return await new Promise((resolve, reject) => {
            SqliteExecution.db.all(query, params, (err, rows) => {
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

    /**
     * 
     * @param {string} query 
     * @param {any[]} data 
     * @returns {Promise<{rows: number}>}
     */
    static async bulkInsert(query, data) {
        return new Promise((resolve, reject) => {
            SqliteExecution.db.run("BEGIN TRANSACTION");
            const stmt = SqliteExecution.db.prepare(query);

            data.forEach(row => {
                stmt.run(row, err => {
                    if (err) {
                        SqliteExecution.db.run("ROLLBACK");
                        reject(err);
                    }
                });
            });

            stmt.finalize(err => {
                if (err) {
                    SqliteExecution.db.run("ROLLBACK");
                    return reject(err);
                }
                SqliteExecution.db.run("COMMIT", err2 => {
                    if (err2) reject(err2);
                    else resolve({ rows: data.length });
                });
            });
        });
    }
}

module.exports = SqliteExecution;