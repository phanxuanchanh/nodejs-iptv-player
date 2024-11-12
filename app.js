import path from "path";
import express from 'express';
import { engine } from 'express-handlebars';

import { __dirname, app } from './config.js';
import appRoute from './app-route.js';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('hbs', engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('/', path.join(__dirname, 'views'));

app.use('/', appRoute);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
