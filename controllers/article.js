const Article = require('mongoose').model('Article');
const Category = require('mongoose').model('Category');
const Tag = require('mongoose').model('Tag');
const Comment = require('mongoose').model('Comment');
const User = require('mongoose').model('User');
const initializeTags = require('./../models/Tag').initializeTags;
const moment = require('moment');
const fs = require("fs");
module.exports = {
    createGet: (req, res) => {
        if (!req.isAuthenticated()){
            let returnUrl = '/article/create';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Category.find({}).then(categories => {
            res.render('article/create', {categories: categories});
        });
    },
    createPost: (req, res) => {
        if(!req.isAuthenticated()) {
            let returnUrl = '/article/create';
            req.session.returnUrl = returnUrl;
            res.redirect('/user/login');
            return;
        }
        let articleArgs = req.body;

        let errorMsg = '';
        if (!articleArgs.title){
            errorMsg = 'Invalid title!';
        } else if (!articleArgs.content){
            errorMsg = 'Invalid content!';
        }
        if (errorMsg) {
            res.render('article/create', {error: errorMsg});
            return;
        }
        var articleObject = new Article();
        //console.log(req.file);
        if(req.file){
            articleObject.img.data = fs.readFileSync(req.file.path);
            articleObject.img.path=req.file.path;
            articleObject.img.contentType='image/png';
            articleObject.img.name=req.file.filename;
        }
        articleObject.author = req.user.id;
        articleObject.content = req.body.content;
        articleObject.title = req.body.title;
        articleObject.category = req.body.category;
        articleObject.tags = [];
        Article.create(articleObject).then(article => {
            let tagNames = articleArgs.tagNames.split(/\s+|,/).filter(tag => {return tag});
            initializeTags(tagNames, article.id);
            article.prepareInsert();
            res.redirect('/');
        });
    },

    details: (req, res) => {
        let id = req.params.id;

        Article.findById(id).populate('author tags').then(article => {
            Comment.find({article:article.id}).populate('author').then(comment =>{
                User.findOne({_id:comment.author}).then(user => {
                    let date = [];
                    /*for(let i=0;i<comment.length; i++){
                     //console.log(comment[i].date);
                     date.push(comment[i].date);
                     }*/
                    for(let i=0;i<comment.length; i++){
                        //console.log(date[i]);

                        date[i] = moment(comment[i].date).format("H:mm, DD-MMM-YYYY");
                        console.log(date[i]);
                        comment[i].date = date[i];
                        console.log(comment[i].date);
                    }
                    if (!req.user){
                        res.render('article/details', { article: article,comments:comment,author:user,date:date,isUserAuthorized: false});
                        return;
                    }
                    req.user.isInRole('Admin').then(isAdmin => {
                        let isUserAuthorized = isAdmin || req.user.isAuthor(comment);


                        res.render('article/details', { article: article,comments:comment,author:user, date:date,isUserAuthorized: isAdmin});
                    });
                });
            });
        });
    },

    editGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/article/edit/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }
        Article.findById(id).populate('tags').then(article => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(article)) {
                    res.redirect('/');
                    return;
                }
                Category.find({}).then(categories =>{
                    article.categories = categories;

                    article.tagNames = article.tags.map(tag => {return tag.name});
                    res.render('article/edit', article)
                });
            });
        });
    },

    editPost: (req, res) => {
        let id = req.params.id;
        //console.log(id);
        if(!req.isAuthenticated()){
            let returnUrl = `/article/edit/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        let articleArgs = req.body;

        let errorMsg = '';
        if (!articleArgs.title){
            errorMsg = 'Article title cannot be empty!';
        } else if (!articleArgs.content) {
            errorMsg = 'Article content cannot be empty!'
        }

        if(errorMsg) {
            res.render('article/edit', {error: errorMsg})
        } else {
            Article.findById(id).populate('category tags').then(article => {
                if (article.category.id !== articleArgs.category){
                    article.category.articles.remove(article.id);
                    article.category.save();
                }

                article.category = articleArgs.category;
                article.title = articleArgs.title;
                article.content = articleArgs.content;

                let newTagNames = articleArgs.tags.split(/\s+|,/).filter(tag => {return tag});

                // Get me the old article's tags which are not
                // re-entered.
                let oldTags = article.tags
                    .filter(tag => {
                        return newTagNames.indexOf(tag.name) === -1;
                    });

                for(let tag of oldTags){
                    tag.deleteArticle(article.id);
                    article.deleteTag(tag.id);
                }

                initializeTags(newTagNames, article.id);

                article.save((err) => {
                    if(err) {
                        console.log(err.message);
                    }

                    Category.findById(article.category).then(category => {
                        if(category.articles.indexOf(article.id) === -1){
                            category.articles.push(article.id);
                            category.save();
                        }

                        res.redirect(`/article/details/${id}`);
                    })
                });
            });
        }
    },

    deleteGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/article/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Article.findById(id).populate('category tags').then(article => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(article)) {
                    res.redirect('/');
                    return;
                }

                article.tagNames = article.tags.map(tag => {return tag.name});
                res.render('article/delete', article)
            });
        });
    },

    deletePost: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/article/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Article.findById(id).then(article => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(article)) {
                    res.redirect('/');
                    return;
                }

                Article.findOneAndRemove({_id: id}).then(article => {
                   article.prepareDelete();
                   res.redirect('/');
                });
            });
        });
    },

    searchArticleGet: (req,res) => {

        let searchArgs = req.body.search;
        //console.log(req.body.search);
        //console.log(searchArgs.search);
            Article.find({ content: { $regex: searchArgs, $options: 'i' } }).sort({date: -1}).populate('author tags').then(article => {
                Tag.populate(article, {path: 'tags'}, (err) =>{
                    if (err) {
                        console.log(err.message);
                    }
            res.render('home/article', {articles:article});
                });
        });

        //res.redirect('home/index');
    }

};
