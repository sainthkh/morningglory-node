const fs = require('fs');
const jsyaml    = require('js-yaml');
const Sequelize = require("sequelize");

function connectDB () {
	return new Promise((resolve, reject) => {
		fs.readFile('db.yaml', 'utf8', (err, data) => {
			if (err) reject(err);
			else resolve(data);
		});
	})
	.then(yamltext => {
		return jsyaml.safeLoad(yamltext, 'utf8');
	})
	.then(params => {
		seq = new Sequelize(params.dbname, params.username, params.password, params.params);
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

		return {
			Post: post.sync(),
			Series: series.sync() 
		}
	});
}

module.exports = connectDB()