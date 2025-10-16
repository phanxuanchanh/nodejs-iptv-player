window.api.onUpdateAvailable(() => {
  alert('🔔 Có bản cập nhật mới! Đang tải về...');
});

window.api.onUpdateDownloaded(() => {
  if (confirm('✅ Bản cập nhật đã sẵn sàng. Khởi động lại để cài đặt?')) {
    window.api.quitAndInstall();
  }
});

document.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", e => {
        e.preventDefault();
    });
});

const pageParamsString = document.getElementById('page-params').value;

const btnBackEl = document.getElementById('btn-back');

if (btnBackEl !== null && btnBackEl !== undefined) {
    btnBackEl.addEventListener('click', function (e) { window.api.goBack(); });
}

document.getElementById('btn-favorite').addEventListener('click', function (e) {
    const category = document.getElementById('content').getAttribute('content-by-cat');
    window.api.loadList(true, category, null, 1, 24);
});

document.getElementById('btn-all-channels').addEventListener('click', function (e) {
    const category = document.getElementById('content').getAttribute('content-by-cat');
    window.api.loadList(false, category, null, 1, 24);
});

document.querySelectorAll('.categories-dropdown-item').forEach((el, index) => {
    el.addEventListener('click', function (e) {
        let category = el.innerText;
        const showFavoriteList = document.getElementById('content').getAttribute('favorite-content') === 'true';
        window.api.loadList(showFavoriteList, category, null, 1, 24);
    });
});

document.getElementById('btn-about').addEventListener('click', function (e) { window.api.gotoAbout(); });

document.getElementById('btnM3u8Submit').addEventListener('click', function (e) {
    const url = document.getElementById('m3u8link').value;
    const name = document.getElementById('m3u8name').value;

    window.api.addM3U8(name, url);
});

document.getElementById('selectPlaylist').addEventListener('change', function (e) {
    const seletedPlaylist = this.value;
    window.api.selectList(seletedPlaylist);
});

document.getElementById('mainSearch').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter')
        return;

    const keyword = e.target.value;
    const showFavoriteList = document.getElementById('content').getAttribute('favorite-content') === 'true';
    const category = document.getElementById('content').getAttribute('content-by-cat');

    window.api.loadList(showFavoriteList, category, keyword, 1, 24);
});

document.getElementById('btnSettingsSubmit').addEventListener('click', function (e) {
    const selectedLanguage = document.getElementById('selectLanguage').value;
    window.api.submitSettings(selectedLanguage);
});

document.getElementById('btnReset').addEventListener('click', function (e) { window.api.resetSettings(); });