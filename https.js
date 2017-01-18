const Model = require('./model')
const async = require('async')

function https(content) {
	return content.replace(/http:\/\//g, 'https://')
}

Model.PostDB.then(db => {
	return db.findAll()
})
.then(results => {
	async.eachSeries(results, (r, cb2) => {
		Model.PostDB.then(Post => {
			return Post.update({
				content: https(r.content),
			}, {where:{slug:r.slug}})
		})
		.then(a => {
			cb2()
		})
	})
})