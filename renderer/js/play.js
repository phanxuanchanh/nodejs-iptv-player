//=============================================================
/**
 * PLAY PAGE
 */

let scrollPosition = 0;

scrollPosition = window.scrollY;
document.body.style.position = 'fixed';
document.body.style.top = '-' + scrollPosition + 'px';
document.body.style.left = '0';
document.body.style.right = '0';
document.body.style.overflow = 'hidden';
document.body.style.width = '100%';

const channelItemsEl = document.getElementsByClassName('channel-items')[0];
channelItemsEl.style.height = window.innerHeight - 175;

window.addEventListener('resize', function (e) {
    channelItemsEl.style.height = window.innerHeight - 175;
});

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

const btnAddFavoriteEl = document.getElementById('btn-add-favorite');

btnAddFavoriteEl.addEventListener('click', function (e) {
    if (selectedChannelId == 0) {
        alert('No channel selected');
        return;
    }

    const addFavoritePromise = window.api.addFavorite(selectedChannelId);

    addFavoritePromise.then(() => {
        alert('Added to favorites');
    }).catch((err) => {
        alert('Error adding to favorites: ' + err.message);
    });
});