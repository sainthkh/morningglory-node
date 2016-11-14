const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const front = require('./front')
const admin = require('./admin')

exports.init = function(app) {
	app.use(passport.initialize());
	app.use(passport.session());

	app.use('/admin', admin)
	app.use('/', front)
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