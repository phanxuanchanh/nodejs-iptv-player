document.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", e => {
        e.preventDefault();
    });
});

const btnFavoriteEl = document.getElementById('btn-favorite');

btnFavoriteEl.addEventListener('click', function (e) {
    const gotoFavoritesPromise = window.api.loadList(true, null, 1, 24);
    gotoFavoritesPromise.then().catch();
});

const btnAllChannelsEl = document.getElementById('btn-all-channels');

btnAllChannelsEl.addEventListener('click', function (e) {
    const gotoAllChannelsPromise = window.api.loadList(false, null, 1, 24);
    gotoAllChannelsPromise.then().catch();
});

const aboutEl = document.getElementById('btn-about');

aboutEl.addEventListener('click', function (e) {
    const gotoAboutPromise = window.api.gotoAbout();
    gotoAboutPromise.then().catch();
});

const btnM3u8Submit = document.getElementById('btnM3u8Submit');
const m3u8Link = document.getElementById('m3u8link');
const m3u8Name = document.getElementById('m3u8name');

btnM3u8Submit.addEventListener('click', function (e) {
    const url = m3u8Link.value;
    const name = m3u8Name.value;
    const addM3U8Promise = window.api.addM3U8(name, url);

    addM3U8Promise
        .then(() => { })
        .catch(() => { })
});

const selectPlaylistEl = document.getElementById('selectPlaylist');

selectPlaylistEl.addEventListener('change', function (e) {
    const seletedPlaylist = this.value;
    const selectListPromise = window.api.selectList(seletedPlaylist);
    selectListPromise.then().catch();
});

const mainSearchEl = document.getElementById('mainSearch');

mainSearchEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter')
        return;

    const keyword = e.target.value;
    const showFavoriteList = document.getElementById('content').getAttribute('favorite-content') === 'true';

    window.api.loadList(showFavoriteList, keyword, 1, 24)
        .then(result => {
            console.log('Search input:', keyword, result);
        })
        .catch(err => console.error(err));
});

const btnSettingsSubmitEl = document.getElementById('btnSettingsSubmit');

btnSettingsSubmitEl.addEventListener('click', function (e) {
    const selectedLanguage = document.getElementById('selectLanguage').value;
    const submitSettingsPromise = window.api.submitSettings(selectedLanguage);
    submitSettingsPromise.then().catch();
});

const btnResetEl = document.getElementById('btnReset');

btnResetEl.addEventListener('click', function (e) {
    const resetSettingsPromise = window.api.resetSettings();
    resetSettingsPromise.then().catch();
});