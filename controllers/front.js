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
				content: markdown(post.content),
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

const md = require('markdown-it')({
	html: true,
	breaks: true,
})

function markdown(content) {
	return md.render(content)
}

//series
router.get(/^\/series\/([^\\\/]+?)(\/page\/([^\\\/]+?))?(?:\/(?=$))?$/i, (req, res) => {
	var page = normalize_page(req.params[1]) 
	Model.PostDB.then(Post => {
		return Post.findAll({
			where: {series_slug: req.params[0]},
			offset: (page-1)*5,
			limit: page*5,
		})
		.then(posts => {
			posts = _.map(posts, function(post){
				var content = post.content.replace(/<.*?>/g, '')
				content = content.replace(/# Korean Only/g, '')
				content = content.replace(/# With English( Translations)?/g, '')
				content = content.split(' ').splice(0, 60).join(' ')
				post.content = markdown(content) 
				return post
			})
			res.render('series', {
				posts: posts,
			})
		})
	})
})

function normalize_page(page) {
	if (!page) return 1
	return page
}

module.exports = router

