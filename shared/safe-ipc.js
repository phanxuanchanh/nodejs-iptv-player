const { ipcMain } = require("electron");
const Window = require("../logic/windows");

/**
 * A wrapper around ipcMain to handle errors gracefully.
 * | Một lớp bọc mỏng cho ipcMain để xử lý lỗi một cách trơn tru.
 * @class SafeIpc
 */
class SafeIpc {
    /**
     * @type {Window}
     */
    static #window

    /**
     * 
     * @param {Window} window 
     */
    static setWindow(window) { SafeIpc.#window = window; }

    /**
     * 
     * @param {string} channel 
     * @param {(event: Electron.IpcMainEvent, ...args: any)} listener 
     */
    static on(channel, listener) {
        ipcMain.on(channel, async (event, ...args) => {
            try {
                await listener(event, ...args);
            } catch (err) {
                console.debug(err);
                await SafeIpc.#window.showMsgBox('info', 'Error', err.message, ['OK'])
            }
        });
    }

    /**
     * 
     * @param {string} channel 
     * @param {(event: Electron.IpcMainEvent, ...args: any)} listener
     * @returns {Promise<any>}
     */
    static handle(channel, listener) {
        ipcMain.handle(channel, async(event, ...args) => {
            try {
                return await listener(event, ...args);
            } catch (err) {
                console.debug(err);
                throw new Error('Error handling IPC: ' + err.message);
            }
        });
    }
}

module.exports = SafeIpc;