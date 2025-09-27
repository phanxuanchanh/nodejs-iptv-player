function getPagination(page, pageSize) {
    const showFavoriteList = document.getElementById('content').getAttribute('favorite-content') === 'true';
    const category = document.getElementById('content').getAttribute('content-by-cat');
    const searchKeyword = document.getElementById('mainSearch').value;

    window.api.loadList(showFavoriteList, category, searchKeyword, page, pageSize);
}

document.querySelectorAll('.channel-card').forEach((el, index) => {
    el.addEventListener('click', function (e) {
        let id = el.getAttribute('data-id');
        
        window.api.getChannel(id);
    });
});