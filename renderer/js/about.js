//=============================================================
/**
 * ABOUT
 */

const githubLinkEl = document.getElementById('github-link');
const websiteLinkEl = document.getElementById('website-link');

githubLinkEl.addEventListener('click', function (e) {
    e.preventDefault();
    const openGithubLinkPromise = window.api.openLink(githubLinkEl.href);

    openGithubLinkPromise.then().catch();
});

websiteLinkEl.addEventListener('click', function (e) {
    e.preventDefault();
    const openWebsiteLinkPromise = window.api.openLink(websiteLinkEl.href);

    openWebsiteLinkPromise.then().catch();
});