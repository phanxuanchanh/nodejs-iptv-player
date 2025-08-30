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
    }, 3000);
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