const btnM3u8Submit = document.getElementById('btnM3u8Submit');

btnM3u8Submit.addEventListener('click', function (e) {
    const m3uLink = document.getElementById('m3u8link').value;
    const m3uName = document.getElementById('m3u8name').value;
    const addM3U8Promise = window.api.addM3U8(m3uName, m3uLink);

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