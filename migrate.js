const Model = require('./model')
const mongodb     = require("mongodb");
const MongoClient = require('mongodb').MongoClient;
const async = require('async')
const fs = require('fs')

if(fs.existsSync('db.sqlite3')) {
	fs.unlinkSync('db.sqlite3')
	console.log('DB File deleted')
}

var db;
function connectMongo() {
	return new Promise(function(resolve, reject) {
		MongoClient.connect('mongodb://localhost/morningglory_db', (err, _db) => {
			if (err) return reject(err);
			db = _db
			resolve(_db)
		})
	})
}

connectMongo()
.then(db => {
	async.series([
		function(cb1) {
			var pages = db.collection('page')
			pages.find().toArray((err, pages) => {
				async.eachSeries(pages, (page, cb2) => {
					Model.PostDB.then(Post => {
						return Post.create({
							slug: page.slug,
							title: page.title,
							content: clean_content(page.content),
							series_slug: null,
							published_date: page.published_date,
							last_modified_date: page.last_modified_date
						})
					})
					.then(a => {
						cb2()
					})
				},
				err => {
					cb1()
				})
			})
		},
		function(cb1) {
			var series = db.collection('series')
			series.find().toArray((err, seriesSet) => {
				async.eachSeries(seriesSet, (series, cb2) => {
					Model.SeriesDB.then(Series => {
						return Series.create({
							slug: series.slug,
							name: series.title,
							category: series.category_slug
						})
					})
					.then(a => {
						cb2()
					})
				},
				err => {
					cb1()
				})
			})
		},
		function(cb1) {
			var posts = db.collection('post')
			posts.find().toArray((err, posts) => {
				async.eachSeries(posts, (post, cb2) => {
					Model.PostDB.then(Post => {
						return Post.create({
							slug: post.slug,
							title: post.title,
							content: clean_content(post.content),
							series_slug: post.series_slug,
							published_date: post.published_date,
							last_modified_date: post.last_modified_date
						})
					})
					.then(a => {
						cb2()
					})
				},
				err => {
					cb1()
				})
			})
		}
	])
})

function clean_content(content){
	content = content.replace(/<<\/?.+>>/g, '')
	content = content.replace(/\(\$\s*(.+)\s*\$\)/g, '![$1](/images/$1)')
	content = content.replace(/(#+)/g, '$1 ')
	return content
}