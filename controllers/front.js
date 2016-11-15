const querystring = require('querystring')
const express = require('express')
const passport = require('passport');
const _ = require('underscore')

const Model = require('../model')
const config = require('../config')

const router = express.Router()

// category data
router.use((req, res, next) => {
	Model.SeriesDB.then(db => {
		db.findAll()
		.then(seriesSet => {
			var categories = _.map(
				_.groupBy(seriesSet, series => { return series.category }), 
				seriesSet => {
					return {
						title: config.categories[seriesSet[0].category],
						series: seriesSet
					}
				}
			)

			res.locals.categories =  _.map(config.categories, (name, slug) => {
				return _.findWhere(categories, {title: name})
			})
			next()
		})
	})
})

//login
router.get('/login', (req, res) => {
	res.render('login')
})

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/admin',
		failureRedirect: '/login',
		failureFlash: true
	})(req, res, next)
})

router.get('/logout', (req, res) => {
	req.logout()
	res.redirect('/')
})

//single
router.get('/:slug', (req, res) => {
	Model.PostDB.then(Post => {
		return Post.find({ where: {slug: normalize_slug(req.params.slug)}})
		.then(post => {
			res.render('single', {
				page_title: post.title,
				title: post.title,
				content: post.content,
			})
		})
	})
})

function normalize_slug(slug) {
	if (!slug.includes('%')) {
		slug = querystring.escape(slug)
	}
	return slug.toLowerCase()
}

module.exports = router

