const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  loadList: (search, page, pageSize) => ipcRenderer.invoke("list.load", search, page, pageSize),  
  getChannel: (id, search, page, pageSize) => ipcRenderer.invoke("channel.get", id, search, page, pageSize),
});