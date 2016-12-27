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

// index
router.get(/^\/(?:page\/([^\\\/]+?))?(?:\/(?=$))?$/i, (req, res) => {
	var page = normalize_page(req.params[0])
	Model.PostDB.then(Post => {
		Post.count().then(count => {
			res.locals.pagination = pagination(Math.ceil(count/5), page)
			res.locals.pagination.base_url = "/page/"
		})
	})
	Model.PostDB.then(Post => {
		return Post.findAll({
			offset: (page-1)*5,
			limit: 5,
			order: 'published_date DESC',
		})
		.then(posts => {
			posts = _.map(posts, function(post){
				var content = post.content.replace(/<.*?>/g, '')
				content = content.replace(/!\[.*\]\(.*\)/g, '')
				content = content.replace(/# Korean Only/g, '')
				content = content.replace(/# With English( Translations)?/g, '')
				content = content.split(' ').splice(0, 60).join(' ')
				post.content = markdown(content) 
				return post
			})
			res.render('index', {
				posts: posts,
			})
		})
	})
})

//single
router.get('/:slug', (req, res, next) => {
	Model.PostDB.then(Post => {
		return Post.find({ where: {slug: normalize_slug(req.params.slug)}})
		.then(post => {
			res.render('single', {
				page_title: post.title,
				title: post.title,
				content: markdown(post.content),
			})
		})
		.catch(err => {
			err.status = 404
			next(err)
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
router.get(/^\/series\/([^\\\/]+?)(?:\/page\/([^\\\/]+?))?(?:\/(?=$))?$/i, (req, res) => {
	var page = normalize_page(req.params[1])
	var slug = req.params[0]
	Model.PostDB.then(Post => {
		Post.count({ where: {series_slug: slug}})
		.then(count => {
			res.locals.pagination = pagination(Math.ceil(count/5), page)
			res.locals.pagination.base_url = "/series/" + slug + "/page/" 
		})
	})
	Model.PostDB.then(Post => {
		return Post.findAll({
			where: {series_slug: slug},
			offset: (page-1)*5,
			limit: 5,
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

//old series
router.get(/^\/series\/([^\\\/]+?)\/list(?:\/page\/([^\\\/]+?))?(?:\/(?=$))?$/i, (req, res) => {
	var page = normalize_page(req.params[1])
	var slug = req.params[0]
	
	var url = ''
	if(page == 1) {
		res.redirect('/series/' + slug)
	} else {
		res.redirect('/series/' + slug + '/page/' + page)
	}
})

function normalize_page(page) {
	if (!page) return 1
	return page
}

function pagination(page_count, current_page) {
	page_count = parseInt(page_count)
	current_page = parseInt(current_page)
	var context = {}
	context.current = current_page

	var start_pn, end_pn; // pn = page_number
	if (page_count <= 10) {
		start_pn = 1
		end_pn = page_count + 1
	} else {
		if (current_page < 6) {
			context.next = 11
			start_pn = 1
			end_pn = 11
		} else {
			context.previous = current_page - 5

			if (page_count > current_page + 5) {
				context.next = current_page + 6
				start_pn = current_page - 4
				end_pn = current_page + 6
			} else {
				start_pn = current_page - 4
				end_pn = current_page + 1
			}
		}
	}

	context.page_numbers = []

	for(var i = start_pn; i < end_pn; i++) {
		context.page_numbers.push(i)
	}

	return context
}

module.exports = router

