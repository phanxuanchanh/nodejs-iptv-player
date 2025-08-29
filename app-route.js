// import { router } from './config.js';
// import { getChannelsFromM3U8 } from './m3u8-list-handler.js';
// import { get, getPaginatedData1, getPaginatedData2, bulkInsert } from './sqlite.js';

// router.get('/', async (req, res) => {
//     try {
//         let paginatedData = null;
//         if (req.query.search) {
//             const where = 'name LIKE ? OR "group" LIKE ?';
//             const whereParams = [`%${req.query.search}%`, `%${req.query.search}%`];
//             paginatedData = await getPaginatedData2('all_channels', where, whereParams, req.query.page || 1, req.query.pageSize || 16);
//         } else {
//             paginatedData = await getPaginatedData1('all_channels', req.query.page || 1, req.query.pageSize || 16);
//         }

//         res.render('home.hbs', { paginatedData: paginatedData, layout: 'main-layout' });
//     } catch (err) {
//         res.render('error.hbs', { error: err, layout: null })
//     }
// });

// router.get('update-data', async (req, res) => {
//     try {
//         res.render('update-data.hbs', { layout: 'main-layout' });
//     } catch (err) {
//         res.render('error.hbs', { error: err, layout: null });
//     }
// })

// router.post('/update-channel-list', async (req, res) => {
//     try {
//         const channels = await getChannelsFromM3U8(process.env.M3U8_URL);
//         const query = 'INSERT INTO all_channels (name, logo, "group", url) VALUES (?, ?, ?, ?)';
//         const data = [];

//         channels.forEach(channel => {
//             data.push([channel.name, channel.logo, channel.group, channel.url]);
//         })

//         const qres = await bulkInsert(query, data);
//         console.log(qres);

//         res.redirect('/');
//     } catch (err) {
//         res.render('error.hbs', { error: err, layout: null })
//     }
// });

// router.get('/play/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (id === undefined || id == null || id == 0)
//             res.redirect('/');

//         const query = 'SELECT * FROM all_channels WHERE id = ?';
//         const item = await get(query, [id]);

//         let paginatedData = null;
//         if (req.query.search) {
//             const where = 'name LIKE ? OR "group" LIKE ?';
//             const whereParams = [`%${req.query.search}%`, `%${req.query.search}%`];
//             paginatedData = await getPaginatedData2('all_channels', where, whereParams, req.query.page || 1, req.query.pageSize || 50);
//         } else {
//             paginatedData = await getPaginatedData1('all_channels', req.query.page || 1, req.query.pageSize || 50);
//         }

//         res.render('play.hbs', { item: item, paginatedData: paginatedData, layout: 'main-layout' });
//     } catch (err) {
//         res.render('error.hbs', { error: err, layout: null })
//     }
// });

// export default router;