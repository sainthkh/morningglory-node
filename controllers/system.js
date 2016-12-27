const express = require('express')

const Model = require('../model')

const router = express.Router()

router.get('/sitemap.xml', (req, res) => {
	Model.PostDB.then(Post => {
		return Post.findAll({
			attributes: ['slug', 'last_modified_date']
		})
		.then(posts => {
			posts = posts.map(post => {
				return {
					slug: post.slug,
					last_modified_date: dateString(new Date(post.last_modified_date)),
				}
			})
			res.set('Content-Type', 'text/xml')
			res.render('sitemap', {
				layout: false,
				posts: posts
			})
		})
	})
})

function dateString(date) {
	return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
}

router.get('/rss', (req, res) => {
	Model.PostDB.then(Post => {
		return Post.findAll({
			offset: 0,
			limit: 20,
			order: 'published_date DESC',
		})
		.then(posts => {
			res.set('Content-Type', 'application/rss+xml')
			res.render('rss', {
				layout: false,
				posts: posts,
				now: new Date()
			})
		})
	})
})

module.exports = router