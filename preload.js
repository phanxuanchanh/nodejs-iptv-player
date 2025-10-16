const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  loadList: (favorited, categoryName, search, page, pageSize) => ipcRenderer.send("list.load", favorited, categoryName, search, page, pageSize),
  selectList: (id) => ipcRenderer.send('list.select', id),
  getChannel: (id, search, page, pageSize) => ipcRenderer.send("channel.get", id, search, page, pageSize),
  addFavorite: (id) => ipcRenderer.invoke('channel.addfavorite', id),
  removeFavorite: (id) => ipcRenderer.invoke('channel.removefavorite', id),
  addM3U8: (name, url) => ipcRenderer.send('add.m3u8.link', name, url),
  gotoAbout: () => ipcRenderer.send('goto.about'),
  goBack: () => ipcRenderer.send('go.back'),
  addToHistory: (pageParamsString) => ipcRenderer.send('history.add', pageParamsString),
  openLink: (url) => ipcRenderer.send('link.open', url),
  resetSettings: () => ipcRenderer.send('settings.reset'),
  submitSettings: (lang) => ipcRenderer.send('settings.submit', lang),
  showMsgBox: (type, title, message, buttons) => ipcRenderer.send('msgbox.show', type, title, message, buttons),
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  quitAndInstall: () => ipcRenderer.send('quit.install')
});