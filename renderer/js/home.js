function getPagination(page, pageSize) {
    const showFavoriteList = document.getElementById('content').getAttribute('favorite-content') === 'true';
    window.api.loadList(showFavoriteList, null, page, pageSize);
}

const channelCards = document.querySelectorAll('.channel-card');

channelCards.forEach((el, index) => {
    el.addEventListener('click', function (e) {
        let id = el.getAttribute('data-id');
        window.api.getChannel(id);
    });
});
