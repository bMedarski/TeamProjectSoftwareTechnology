const mongoose = require('mongoose');
const User = mongoose.model('User');
const Category = mongoose.model('Category');
const Tag = mongoose.model('Tag');
const Article = mongoose.model('Article');
const Picture = mongoose.model('Picture');
const moment = require('moment');

module.exports = {
    /*index: (req, res) => {
        Category.find({}).then(categories => {
            res.render('home/index',{categories: categories});
        })
    },*/

    index: (req, res) => {
        Article.find({}).sort({date: -1}).limit(3).populate('author tags').then(articles => {
        date = [];
            for(let i=0;i<articles.length; i++){
                date.push(articles[i].date);
                //console.log(date[i]);
                //articles[i].created = moment(date[i].substring(4,15)).format("dd MMM YYYY");
            }
            for(let i=0;i<articles.length; i++){
                //date[i]=moment(date[i]);
                //articles[i].created=date[i].substring(4,15);
                articles[i].created = moment(date[i]).format("H:mm, DD-MMM-YYYY");
            }
                Category.find({}).then(categories => {
                res.render('home/index', {articles: articles,categories: categories, moment:moment});
                });
        });
    },

    listCategoryArticles: (req, res) => {
        let id = req.params.id;

        Category.findById(id).populate('articles').then(category => {
            User.populate(category.articles,{path: 'author'}, (err) =>{
                if (err) {
                    console.log(err.message);
                }

                Tag.populate(category.articles, {path: 'tags'}, (err) =>{
                    if (err) {
                        console.log(err.message);
                    }

                    res.render('home/article', {articles: category.articles})
                });
            });
        });
    },

    listCategoryPictures: (req, res) => {
        let id = req.params.id;

        Category.findById(id).populate('pictures').then(category => {
            User.populate(category.pictures,{path: 'author'}, (err) =>{
                if (err) {
                    console.log(err.message);
                }
                Tag.populate(category.pictures, {path: 'tags'}, (err) =>{
                    if (err) {
                        console.log(err.message);
                    }

                    res.render('home/picture-categories', {pictures: category.pictures})
                });
            });
        });
    }
};
