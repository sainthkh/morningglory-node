
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('./config')

exports.init = function(app) {
	app.use(passport.initialize());
	app.use(passport.session());

	app.get('/login', login)
	app.post('/login', post_login)
	app.get('/logout', logout)

	app.get('/admin')
}

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next()
	}
	res.redirect('/login')
};

function login(req, res){
	res.render('login')
}

function post_login(req, res, next){
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	})(req, res, next)
}

function logout(req, res) {
	req.logout()
	res.redirect('/')
}

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(userid, done) {
	if (!userid) done(null)
	else done(null, {id: userid})
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		if(username == config.user.id && password == config.user.pw) {
			done(null, { id: username })
		} else {
			done(null, false, {message:"ID doesn't exist or password didn't match"})
		}
	}
))