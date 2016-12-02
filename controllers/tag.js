const Article = require('mongoose').model('Article');
const Picture = require('mongoose').model('Picture');
const Tag = require('mongoose').model('Tag');

module.exports = {
    listArticlesByTag: (req, res) => {
        let name = req.params.name;

        Tag.findOne({name: name}).then(tag => {
            Article.find({tags: tag.id}).populate('author tags')
                .then(articles => {
                res.render('tag/details',{articles: articles, tag : tag});
            })
        })
    },

    listPicturesByTag: (req, res) => {
        let name = req.params.name;

        Tag.findOne({name: name}).then(tag => {
            picture.find({tags: tag.id}).populate('author tags')
                .then(pictures => {
                    res.render('tag/details',{pictures: pictures, tag : tag});
                })
        })
    }
};


