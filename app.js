//seting environment variable
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const path = require('path');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const deleteExpiredTokens = require('./middleware/cleanUpTokens');
const cookieParser = require('cookie-parser');

//all route middleware
app.use(cookieParser());


var connectDB = require('./db/connect');
connectDB();

var indexRouter = require('./router/index');

//seting up session 
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);

// Schedule the cleanup job to run every hour
cron.schedule('0 0 * * *', deleteExpiredTokens);

app.listen(port, () => console.log("server connected..."))