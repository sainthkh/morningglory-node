const path = require('path')

const exphbs = require('express-handlebars')
const express = require('express');
const bodyparser = require('body-parser')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const favicon = require('serve-favicon')
const config = require('./config')

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(session({
	store: new RedisStore({
		url: 'redis://localhost:6379'
	}),
	secret: config.secret,
	resave: false,
	saveUninitialized: false
}))

var hbs = exphbs.create({
	defaultLayout: 'layout',
	extname: '.hbs',
	layoutsDir: path.join(__dirname, 'views'),
	partialsDir: path.join(__dirname, 'views'),
	helpers: {
		choose: (a, b) => { return a ? a:b },
		ifEqual: function(a, b, options) { 
			if (a == b) return options.fn(this)
			else return options.inverse(this) 
		}
	}
})

app.engine('.hbs', hbs.engine)
app.set('view engine', '.hbs')

//Init modules here
require('./controllers').init(app)

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});