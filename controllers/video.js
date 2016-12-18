const Article = require('mongoose').model('Article');
const Category = require('mongoose').model('Category');
const Tag = require('mongoose').model('Tag');
const Comment = require('mongoose').model('Comment');
const User = require('mongoose').model('User');
const initializeTags = require('./../models/Tag').initializeTags;
const Video = require('mongoose').model('Video');
const moment = require('moment');
const fs = require("fs");

module.exports = {
    getVideo: (req, res) => {
        Video.find({}).sort({date: -1}).limit(3).populate('author').then(video => {
            /*date = [];
             for(let i=0;i<pictures.length; i++){
             date.push(pictures[i].date);
             }
             for(let i=0;i<pictures.length; i++){
             pictures[i].created = moment(date[i]).format("H:mm, DD-MMM-YYYY");
             }*/
            Category.find({}).then(categories => {
                res.render('home/video', {videos: video,categories: categories});
            });
        });
    },
    createGet: (req, res) => {
        if (!req.isAuthenticated()){
            let returnUrl = '/video/create';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Category.find({}).then(categories => {
            res.render('video/create', {categories: categories});
        });
    },
    createPost: (req, res) => {
        if(!req.isAuthenticated()) {
            let returnUrl = '/video/create';
            req.session.returnUrl = returnUrl;
            res.redirect('/user/login');
            return;
        }
        let videoArgs = req.body;

        let errorMsg = '';
        if (!videoArgs.title){
            errorMsg = 'Invalid title!';
        } else if (!videoArgs.content){
            errorMsg = 'Invalid description!';
        } else if (!videoArgs.link) {
            errorMsg = 'Invalid link!';
        }
        if (errorMsg) {
            res.render('video/create', {error: errorMsg});
            return;
        }
        var videoObject = new Video();
        //console.log(req.file);
        videoObject.author = req.user.id;
        videoObject.content = req.body.content;
        videoObject.title = req.body.title;
        videoObject.category = req.body.category;
        videoObject.videoLink = req.body.link;
        Video.create(videoObject).then(video => {
            video.prepareInsert();
            res.redirect('/home/video');
        });
    },

    details: (req, res) => {
        let id = req.params.id;
        Video.findById(id).populate('author').then(video => {

            Comment.find({video:video.id}).populate('author').then(comment =>{
                User.findOne({_id:comment.author}).then(user => {

                    let date = video.date;
                    video.date = moment(date).format("H:mm, DD-MMM-YYYY");

                        /* let date = [];
                         for(let i=0;i<comment.length; i++){
                             //console.log(comment[i].date);
                             date.push(moment(comment[i].date).format("H:mm, DD-MMM-YYYY"));
                         }*/
                    /* for(let i=0;i<comment.length; i++){
                     //console.log(date[i]);

                     /!*date[i] = moment(comment[i].date).format("H:mm, DD-MMM-YYYY");
                     comment[i].date= date[i].substring(0,16);*!/
                     //comment[i].date = moment(comment[i].date).format("H:mm, DD-MMM-YYYY");
                     //console.log(comment[i].date);
                     }*/
                    if (!req.user){
                        res.render('video/details', { video: video,comments:comment,author:user,isUserAuthorized: false});
                        return;
                    }
                    req.user.isInRole('Admin').then(isAdmin => {
                        let isUserAuthorized = isAdmin || req.user.isAuthor(comment);
                        res.render('video/details', { video: video,comments:comment,author:user,isUserAuthorized: isUserAuthorized});
                    });
                });
            });
        });
    },

    /*editGet: (req, res) => {
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
    },*/

    searchVideoGet: (req,res) => {

        let searchArgs = req.body.search;
        //console.log(req.body.search);
        //console.log(searchArgs.search);
        Video.find({ title: { $regex: searchArgs, $options: 'i' } }).sort({date: -1}).populate('author').then(video => {


            res.render('home/searchVideo', {videos:video});
        });
    }
};
