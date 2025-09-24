function getPagination(page, pageSize) {
    const showFavoriteList = document.getElementById('content').getAttribute('favorite-content') === 'true';

    let loadListPromise = window.api.loadList(showFavoriteList, null, page, pageSize);
    loadListPromise.then((result) => {
        console.log('Pagination clicked:', page, pageSize, result);
    }).catch((err) => {
        alert('Lỗi');
    });
}

const channelCards = document.querySelectorAll('.channel-card');

channelCards.forEach((el, index) => {
    el.addEventListener('click', function (e) {
        let id = el.getAttribute('data-id');
        let getChannelPromise = window.api.getChannel(id);

        getChannelPromise.then((result) => {
            console.log('Channel clicked:', id, result);
        });
    });
});
