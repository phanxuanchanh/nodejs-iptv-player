const { ipcMain } = require("electron");
const Window = require("../logic/windows");

/**
 * 
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
                console.debug(err.message);
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
                console.debug(err.message);
                await SafeIpc.#window.showMsgBox('info', 'Error', err.message, ['OK'])
            }
        });
    }
}

module.exports = SafeIpc;