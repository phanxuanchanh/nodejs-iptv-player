//=============================================================
/**
 * ABOUT
 */

document.getElementById('github-link').addEventListener('click', function (e) {
    e.preventDefault();
    window.api.openLink(githubLinkEl.href);
});

document.getElementById('website-link').addEventListener('click', function (e) {
    e.preventDefault();
    window.api.openLink(websiteLinkEl.href);
});