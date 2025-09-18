const axios = require('axios');
const m3u8Parser = require('m3u8-parser');

module.exports = { getChannelsFromM3U8 };

/**
 * 
 * @param {string} line 
 * @returns {{tvg_id: string, tvg_logo: string, group_title: string}}
 */
function parseExtinf(line) {
    const regex = /-1\s+tvg-id="([^"]*)"\s+tvg-logo="([^"]*)"\s+group-title="([^"]*)",(.+)/;
    const matches = line.match(regex);

    if (matches) {
        return {
            tvg_id: matches[1] || "",
            tvg_logo: matches[2] || "",
            group_title: matches[3] || ""
        };
    } else {
        return null;
    }
}

/**
 * 
 * @param {string} url 
 * @returns {Promise<{name: string, logo: string, group: string, url: string}[]>} 
 */
async function getChannelsFromM3U8(url) {
    const response = await axios.get(url);
    const m3u8Data = response.data;

    const parser = new m3u8Parser.Parser();
    parser.push(m3u8Data);
    parser.end();

    const parsedManifest = parser.manifest;
    const channels = [];

    parsedManifest.segments.forEach(segment => {
        let EXTINF = parseExtinf(segment.title);

        if (EXTINF !== null && EXTINF.tvg_id !== '') {
            const channel = {
                name: EXTINF.tvg_id,
                logo: EXTINF.tvg_logo || 'No Logo',
                group: EXTINF.group_title || 'Unknown Group',
                url: segment.uri || 'No URL'
            };
            channels.push(channel);
        }
    });

    return channels;
}