document.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", e => {
        e.preventDefault();
    });
});

const btnFavoriteEl = document.getElementById('btn-favorite');

btnFavoriteEl.addEventListener('click', function (e) { window.api.loadList(true, null, 1, 24); });

const btnAllChannelsEl = document.getElementById('btn-all-channels');

btnAllChannelsEl.addEventListener('click', function (e) { window.api.loadList(false, null, 1, 24); });

const aboutEl = document.getElementById('btn-about');

aboutEl.addEventListener('click', function (e) { window.api.gotoAbout(); });

const btnM3u8Submit = document.getElementById('btnM3u8Submit');
const m3u8Link = document.getElementById('m3u8link');
const m3u8Name = document.getElementById('m3u8name');

btnM3u8Submit.addEventListener('click', function (e) {
    const url = m3u8Link.value;
    const name = m3u8Name.value;
    window.api.addM3U8(name, url);
});

const selectPlaylistEl = document.getElementById('selectPlaylist');

selectPlaylistEl.addEventListener('change', function (e) {
    const seletedPlaylist = this.value;
    window.api.selectList(seletedPlaylist);
});

const mainSearchEl = document.getElementById('mainSearch');

mainSearchEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter')
        return;

    const keyword = e.target.value;
    const showFavoriteList = document.getElementById('content').getAttribute('favorite-content') === 'true';

    window.api.loadList(showFavoriteList, keyword, 1, 24);
});

const btnSettingsSubmitEl = document.getElementById('btnSettingsSubmit');

btnSettingsSubmitEl.addEventListener('click', function (e) {
    const selectedLanguage = document.getElementById('selectLanguage').value;
    window.api.submitSettings(selectedLanguage);
});

const btnResetEl = document.getElementById('btnReset');

btnResetEl.addEventListener('click', function (e) { window.api.resetSettings(); });