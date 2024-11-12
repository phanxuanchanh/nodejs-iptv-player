import { router } from './config.js';
import { getChannelsFromM3U8 } from './m3u8-list-handler.js';
import { get, getPaginatedData, bulkInsert } from './sqlite.js';

router.get('/', async (req, res) => {
    const paginatedData = await getPaginatedData('all_channels', req.query.page || 1, req.query.pageSize || 10);
    res.render('home.hbs', { paginatedData: paginatedData, layout: 'main-layout' });
});

router.post('/update-channels-list', async (req, res) => {
    try {
        const channels = await getChannelsFromM3U8(process.env.M3U8_URL);
        const query = 'INSERT INTO all_channels (name, logo, "group", url) VALUES (?, ?, ?, ?)';
        const data = [];

        channels.forEach(channel => {
            data.push([channel.name, channel.logo, channel.group, channel.url]);
        })

        console.log('Called');
        const qres = await bulkInsert(query, data);
        console.log(qres);

        res.redirect('/');
    } catch (err) {

    }
});

router.get('/play/:id', async (req, res) => {
    const id = req.params.id;
    if(id === undefined || id == null || id == 0)
        res.redirect('/');

    const query = 'SELECT * FROM all_channels WHERE id = ?';
    const item = await get(query, [ id ]);

    console.log(item);
    res.render('play.hbs', { item: item, layout: 'main-layout' });
});

export default router;