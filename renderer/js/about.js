//=============================================================
/**
 * ABOUT
 */

const githubLinkEl = document.getElementById('github-link');
const websiteLinkEl = document.getElementById('website-link');

githubLinkEl.addEventListener('click', function (e) {
    e.preventDefault();
    window.api.openLink(githubLinkEl.href);
});

websiteLinkEl.addEventListener('click', function (e) {
    e.preventDefault();
    window.api.openLink(websiteLinkEl.href);
});