import axios from 'axios';
import m3u8Parser from 'm3u8-parser';

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

export async function getChannelsFromM3U8(url) {
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