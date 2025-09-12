const videoJs_CssPath = '<<VIDEOJS-CSSPATH>>';
const videoJs_JsPath = '<<VIDEOJS-JSPATH>>';
const videoJsHttpStreaming_JsPath = '<<VIDEOJS-HTTP-STREAMING-JSPATH>>';
const videoJsqQualitySelect_JsPath = '<<VIDEOJS-QUALITY-SELECTOR-JSPATH>>';

async function addVideoJsCss() {
    return new Promise((resolve, reject) => {
        const videoJslink = document.createElement('link');
        videoJslink.rel = 'stylesheet';
        videoJslink.href = videoJs_CssPath;

        videoJslink.onload = () => resolve();
        videoJslink.onerror = () => reject(new Error(`Failed to load ${videoJs_CssPath}`));

        document.head.appendChild(videoJslink);
    });
}

async function addVideoJsScript() {
    return new Promise((resolve, reject) => {
        const videoJsScript = document.createElement('script');
        videoJsScript.src = videoJs_JsPath;

        videoJsScript.onload = () => resolve();
        videoJsScript.onerror = () => reject(new Error(`Failed to load ${videoJs_JsPath}`));

        document.head.appendChild(videoJsScript);
    })
}

async function addVideoJsHttpStreamingScript() {
    return new Promise((resolve, reject) => {
        const videoJsHttpStreamingScript = document.createElement('script');
        videoJsHttpStreamingScript.src = videoJsHttpStreaming_JsPath;

        videoJsHttpStreamingScript.onload = () => resolve();
        videoJsHttpStreamingScript.onerror = () => reject(new Error(`Failed to load ${videoJsHttpStreaming_JsPath}`));

        document.head.appendChild(videoJsHttpStreamingScript);
    });
}

async function addVideoJsQualitySelectorScript() {
    return new Promise((resolve, reject) => {
        const videoJsQualitySelectorScript = document.createElement('script');
        videoJsQualitySelectorScript.src = videoJsqQualitySelect_JsPath;

        videoJsQualitySelectorScript.onload = () => resolve();
        videoJsQualitySelectorScript.onerror = () => reject(new Error(`Failed to load ${videoJsqQualitySelect_JsPath}`));

        document.head.appendChild(videoJsQualitySelectorScript);
    });
}

Promise.all([addVideoJsCss(), addVideoJsScript(), addVideoJsHttpStreamingScript(),  addVideoJsQualitySelectorScript()])
    .then(() => {
        const playJsScript = document.createElement('script');
        playJsScript.defer = true;
        playJsScript.textContent = `<<PLAY-JSCONTENT>>`;
        document.body.appendChild(playJsScript);
    }).catch(err => console.error(err));