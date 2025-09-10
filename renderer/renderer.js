const aboutEl = document.getElementById('about');

if(aboutEl !== undefined && aboutEl !== null){
    aboutEl.addEventListener('click', function(e){
        const gotoAboutPromise = window.api.gotoAbout();
        gotoAboutPromise.then().catch();
    });
}

const btnM3u8Submit = document.getElementById('btnM3u8Submit');
const m3u8Link = document.getElementById('m3u8link');

if (btnM3u8Submit !== undefined && btnM3u8Submit !== null) {
    btnM3u8Submit.addEventListener('click', function (e) {
        const url = m3u8Link.value;
        const addM3U8Promise = window.api.addM3U8(url);

        addM3U8Promise
            .then(() => { })
            .catch(() => { })
    });
}

const selectPlaylistEl = document.getElementById('selectPlaylist');

if (selectPlaylistEl !== undefined && btnM3u8Submit !== null) {
    selectPlaylistEl.addEventListener('change', function (e) {
        const seletedPlaylist = this.value;
        const selectListPromise = window.api.selectList(seletedPlaylist);
        selectListPromise.then().catch();
    });
}

const channelCards = document.querySelectorAll('.channel-card');

channelCards.forEach((el, index) => {
    el.addEventListener('click', () => {
        let id = el.getAttribute('data-id');
        let getChannelPromise = window.api.getChannel(id);

        getChannelPromise.then((result) => {
            console.log('Channel clicked:', id, result);
        });
    });
});

function getPagination(page, pageSize) {
    let loadListPromise = window.api.loadList(null, page, pageSize);
    loadListPromise.then((result) => {
        console.log('Pagination clicked:', page, pageSize, result);
    }).catch((err) => {
        alert('Lỗi');
    });
}


let channelItems = document.querySelectorAll('.channel-item');
let searchInput = document.getElementById('searchInput');

channelItems.forEach((el, index) => {
    el.addEventListener('click', () => {
        let id = el.getAttribute('data-id');
        let getChannelPromise = window.api.getChannel(id, searchInput.value, 1, 16);

        getChannelPromise.then((result) => {
            console.log('Channel clicked:', id, result);
        });

        selectedChannelId = id;
    });
});


let selectedChannelId = document.getElementById('video').getAttribute('data-id');
let debounceTimeout;
searchInput.addEventListener('input', (event) => {
    let keyword = event.target.value;
    if (debounceTimeout) 
        clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
        window.api.getChannel(selectedChannelId, keyword, 1, 16)
            .then(result => {
                console.log('Search input:', keyword, result);
            })
            .catch(err => console.error(err));
    }, 1500);
});

const video = document.getElementById('video');
const videoSrc = video.getAttribute('data-url');;

if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
    });
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
    video.addEventListener('loadedmetadata', function () {
        video.play();
    });
} else {
    alert('Trình duyệt của bạn không hỗ trợ phát video HLS');
}

//=============================================================
/**
 * ABOUT
 */

const githubLinkEl = document.getElementById('github-link');

if(githubLinkEl !== undefined && githubLinkEl !== null){
    githubLinkEl.addEventListener('click', function(e){
        e.preventDefault();
        const openGithubLinkPromise = window.api.openLink(githubLinkEl.href);

        openGithubLinkPromise.then().catch();
    })
}

const websiteLinkEl = document.getElementById('website-link');

if(websiteLinkEl !== undefined && websiteLinkEl !== null){
    websiteLinkEl.addEventListener('click', function(e){
        e.preventDefault();
        const openWebsiteLinkPromise = window.api.openLink(websiteLinkEl.href);

        openWebsiteLinkPromise.then().catch();
    });
}