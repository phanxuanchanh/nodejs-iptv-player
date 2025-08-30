let channelCards = document.querySelectorAll('.channel-card');

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
    });
}
