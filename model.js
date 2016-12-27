const fs = require('fs');
const Sequelize = require("sequelize");

function connectDB() {
	seq = new Sequelize("db", "", "", {
		dialect: "sqlite",
		storage: "db.sqlite3"
	});
	var post = seq.define('Post', {
		slug: { type: Sequelize.TEXT, primaryKey: true, unique: true },
		title: Sequelize.TEXT,
		content: Sequelize.TEXT,
		series_slug: Sequelize.TEXT,
		published_date: Sequelize.DATE,
		last_modified_date: Sequelize.DATE
	})
	var series = seq.define('Series', {
		slug: { type: Sequelize.TEXT, primaryKey: true, unique: true },
		name: Sequelize.TEXT,
		category: Sequelize.TEXT
	})

	db = {
		Post: post,
		Series: series 
	}

	module.exports.PostDB = post.sync()
	module.exports.SeriesDB = series.sync()

	return db
}

connectDB()