const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getChannel: (id) => ipcRenderer.invoke("channel.get", id),

});