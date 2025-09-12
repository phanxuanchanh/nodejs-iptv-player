//=============================================================
/**
 * PLAY PAGE
 */

let selectedChannelId = 0;
let channelItems = document.querySelectorAll('.channel-item');

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

let searchInput = document.getElementById('searchInput');

selectedChannelId = document.getElementById('video').getAttribute('data-id');
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

const videoEl = document.getElementById('video');
const videoSrc = videoEl.getAttribute('data-url');
const player = videojs('video', {
    controls: true,
    autoplay: false,
    preload: 'auto',
    fluid: true
});

player.src({ src: videoSrc, type: 'application/x-mpegURL' });
player.hlsQualitySelector();

player.on('loadedmetadata', function () {
    console.log('Video loaded');
});