const querystring = require('querystring')
const express = require('express')
const _ = require('underscore')
const router = express.Router()

const Model = require('../model')

router.use((req, res, next) => {
	if (req.isAuthenticated()) {
		return next()
	}
	res.redirect('/login')
})

router.use((req, res, next) => {
	res.locals.layout = 'admin/layout'
	next()
})

function get_series_list(req, res, next) {
	Model.SeriesDB.then(Series => {
		Series.findAll().then(series_list => {
			res.locals.series = series_list
			next()
		})
	})
}

router.get('/', get_series_list, (req, res) => {
	res.render('admin/write')
})

router.post('/', get_series_list, (req, res) => {
	Model.PostDB.then(Post => {
		return Post.create({
			slug: slugify(req.body.title),
			title: req.body.title,
			content: req.body.content,
			series_slug: req.body.series,
			published_date: Date.now(),
			last_modified_date: Date.now(),
		})
	}).then(post => {
		res.render('admin/write', {
			slug: post.slug,
			title: post.title,
			content: post.content,
			series_slug: post.series_slug,
		})
	})
})

module.exports = router

function slugify(title) {
	var slug = _.map(title, s => {
		console.log(s)
		if (/[a-zA-Z0-9가-힣 \-]/.test(s)) return s;
		return ''
	}).join('')

	slug = slug.replace(/\s+/g, '-')
	slug = querystring.escape(slug)
	slug = slug.replace(/\-\-+/g, '-') // multiple '-' with single '-'
	slug = slug.replace(/^-+/g, '') // Trim - in the front
	slug = slug.replace(/-+$/g, '') // Trim - in the back
	return slug.toLowerCase()
}