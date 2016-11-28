const mongoose = require('mongoose');
const User = mongoose.model('User');
const Category = mongoose.model('Category');
const Tag = mongoose.model('Tag');
const Article = mongoose.model('Article');
<<<<<<< HEAD
const moment = require('moment');
=======
>>>>>>> ce78cc7fc48b9c5d1805d622b5ead55e9f9984ec

module.exports = {
    /*index: (req, res) => {
        Category.find({}).then(categories => {
            res.render('home/index',{categories: categories});
        })
    },*/

    index: (req, res) => {

<<<<<<< HEAD
        Article.find({}).sort({date: -1}).limit(3).populate('author tags').then(articles => {
        date = [];
            for(let i=0;i<articles.length; i++){
                date.push(articles[i].date.toString());
                //console.log(date[i]);
                //articles[i].created = moment(date[i].substring(4,15)).format("dd MMM YYYY");
            }
            for(let i=0;i<articles.length; i++){
                //date[i]=moment(date[i]);
                //articles[i].created=date[i].substring(4,15);
                articles[i].created=moment(articles[i].created).format("DD-MMM-YYYY");

            }
                Category.find({}).then(categories => {


                res.render('home/index', {articles: articles,categories: categories, moment:moment});
=======

        Article.find({}).limit(3).populate('author tags').then(articles => {

                let dateString = articles.date;
                Category.find({}).then(categories => {
                res.render('home/index', {articles: articles,categories: categories});
>>>>>>> ce78cc7fc48b9c5d1805d622b5ead55e9f9984ec
            })
        })
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
    }
};