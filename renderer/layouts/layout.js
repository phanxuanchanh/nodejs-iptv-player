const btnM3u8Submit = document.getElementById('btnM3u8Submit');
const m3u8Link = document.getElementById('m3u8link');

btnM3u8Submit.addEventListener('click', function(e) {
    const url = m3u8Link.value;
    const addM3U8Promise = window.api.addM3U8(url);

    addM3U8Promise
        .then(() => {})
        .catch(() => { })
});