const Model = require('./model')
const async = require('async')
const _ = require('lodash')

const fs = require('fs-extra')
const path = require('path')
const qs = require('querystring')

const root = "E:\\blogs\\wiseinit"

Model.PostDB.then(db => {
	db.findAll()
	.then(posts => {
		async.parallel([
			done => {
				async.each(posts, (post, done2) => {
					let filePath = path.join(root, `books`, `${qs.unescape(post.series_slug)}`, `${qs.unescape(post.slug)}.md`)
					fs.ensureFile(filePath, err => {
						if (err) console.log(err)
						else {
							fs.writeFile(filePath, [
								'---',
								`title: "${post.title.replace(/"/g, '\\"')}"`,
								`published: ${post.published_date.toISOString().split('T')[0]}`,
								`date: ${post.last_modified_date.toISOString().split('T')[0]}`,
								`---`,
								refineContent(post.content)
							].join('\n'), err2 => {
								if (err2) console.log(err2)
								done2()
							})
						}
					})
				}, err => {
					done()
				})
			},
			done => {
				let serieses = _.groupBy(posts, post => {
					return post.series_slug
				})

				async.each(Object.keys(serieses), (slug, done2) => {
					let series = _.orderBy(serieses[slug], post => {
						return post.published_date
					})

					let filePath = path.join(root, `books/${qs.unescape(slug)}`, 'toc.json')
					fs.ensureFile(filePath, err => {
						if (err) console.log(err)
						else {
							fs.writeFile(filePath, JSON.stringify(series.map(post => ({
								file: `${qs.unescape(post.slug)}.md`,
								name: `${post.title}`
							}))), err => {
								if(err) console.log(err)
							})
						}
					})
				})
			},
		])
	})
})

function refineContent(content) {
	content = content.replace(/https?:\/\/wiseinit\.com\/\d+\/\d+\/\d+\/(.*)/g, `/$1`)
	return content
}