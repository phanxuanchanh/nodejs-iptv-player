const m3u8LinkEl = document.getElementById('m3u8link');

m3u8LinkEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter')
        return;

    const url = m3u8LinkEl.value;
    const addM3U8Promise = window.api.addM3U8(url);

    addM3U8Promise
        .then(() => { })
        .catch(() => { })
});

const m3uUrlOrFilesEls = document.querySelectorAll('.m3u-url-file');

m3uUrlOrFilesEls.forEach(el => {
    el.addEventListener('click', function (e) {
        const listId = el.getAttribute('data-id');
        const selectListPromise = window.api.selectList(listId);

        selectListPromise.then().catch();
    });
})