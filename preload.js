const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  loadList: (search, page, pageSize) => ipcRenderer.send("list.load", search, page, pageSize),
  selectList: (id) => ipcRenderer.invoke('list.select', id),
  getChannel: (id, search, page, pageSize) => ipcRenderer.send("channel.get", id, search, page, pageSize),
  addM3U8: (url) => ipcRenderer.invoke('add.m3u8.link', url),
  gotoAbout: () => ipcRenderer.send('goto.about'),
  openLink: (url) => ipcRenderer.send('link.open', url)
});