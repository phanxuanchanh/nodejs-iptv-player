const sqlite3 = require('sqlite3').verbose();

/**
 * 
 */
class SqliteExecution {
    /**
     * @type {sqlite3.Database}
     */
    static db;

    /**
     * Open database connection
     * @param {string} path 
     */
    static open(path) {
        return new Promise((resolve, reject) => {
            SqliteExecution.db = new sqlite3.Database(path, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    /**
     * Close database connection
     * @returns {Promise<void>}
     */
    static close() {
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
     * Run a statement (INSERT/UPDATE/DELETE/DDL)
     * @param {string} sql 
     * @param {any[]} params 
     * @returns {Promise<{ lastID?: any, changes?: any }> | Promise<void> }
     */
    static run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err)
                    return reject(err);

                if(this.lastID && this.lastID > 0 && this.changes && this.changes > 0)
                    return resolve({ lastID: this.lastID, changes: this.changes });

                if (this.lastID && this.lastID > 0)
                    return resolve({ lastID: this.lastID });

                if (this.changes && this.changes > 0)
                    return resolve({ changes: this.changes });

                return resolve();
            });
        });
    }

    /**
     * Get a single row
     * @param {string} query 
     * @param {any[]} params 
     * @returns {Promise<any>}
     */
    static get(query, params = []) {
        return new Promise((resolve, reject) => {
            SqliteExecution.db.get(query, params, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }

    /**
     * Get all rows
     * @param {string} query 
     * @param {any[]} params 
     * @returns {Promise<any[]>}
     */
    static getMany(query, params = []) {
        return new Promise((resolve, reject) => {
            SqliteExecution.db.all(query, params, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }

    /**
     * 
     * @param {string} tableName 
     * @param {int} page 
     * @param {int} pageSize 
     * @returns {Promise<{page: int, pageSize: int, items: []}>}
     */
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

    /**
     * 
     * @param {string} tableName 
     * @param {string} where 
     * @param {[]} whereParams 
     * @param {int} page 
     * @param {int} pageSize 
     * @returns {Promise<{page: int, pageSize: int, items: []}>}
     */
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

    /**
     * 
     * @param {string} query 
     * @param {[]} params 
     * @returns {Promise<{ lastID: any, changes: any }>}
     */
    static insert(query, params = []) {
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
    static bulkInsert(query, data, { useTransaction = true } = {}) {
        return new Promise((resolve, reject) => {
            if(useTransaction)
                SqliteExecution.db.run("BEGIN TRANSACTION");

            const stmt = SqliteExecution.db.prepare(query);

            data.forEach(row => {
                stmt.run(row, err => {
                    if (err) {
                        if(useTransaction)
                            SqliteExecution.db.run("ROLLBACK");

                        reject(err);
                    }
                });
            });

            stmt.finalize(err => {
                if (err) {
                    if(useTransaction)
                        SqliteExecution.db.run("ROLLBACK");

                    return reject(err);
                }
                if(useTransaction) {
                    SqliteExecution.db.run("COMMIT", err2 => {
                        if (err2) reject(err2);
                        else resolve({ rows: data.length });
                    });
                }else {
                    resolve({ rows: data.length });
                }
            });
        });
    }
}

module.exports = SqliteExecution;