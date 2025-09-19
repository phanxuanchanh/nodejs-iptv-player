const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  loadList: (search, page, pageSize) => ipcRenderer.send("list.load", search, page, pageSize),
  selectList: (id) => ipcRenderer.send('list.select', id),
  getChannel: (id, search, page, pageSize) => ipcRenderer.send("channel.get", id, search, page, pageSize),
  addFavorite: (id) => ipcRenderer.invoke('channel.addfavorite', id),
  addM3U8: (name, url) => ipcRenderer.invoke('add.m3u8.link', name, url),
  gotoAbout: () => ipcRenderer.send('goto.about'),
  openLink: (url) => ipcRenderer.send('link.open', url),
  submitSettings: (lang) => ipcRenderer.send('settings.submit', lang)
});