const Article = require('mongoose').model('Article');
const Picture = require('mongoose').model('Picture');
const User = require('mongoose').model('User');
const Category = require('mongoose').model('Category');
const Comment = require('mongoose').model('Comment');
const Video = require('mongoose').model('Video');

module.exports = {
    addComment: (req,res) => {
        if (!req.isAuthenticated()) {
            let returnUrl = '/article/create';
            req.session.returnUrl = returnUrl;
            res.redirect('/user/login');
            return;
        }
        let user = req.user;
        let commentArgs = req.body;
        let id = req.params.id;
        let errorMsg = '';
        if (!commentArgs.comment) {
            errorMsg = 'Missing comment content!';
        }
        if (errorMsg) {
            res.render('article/details', {error: errorMsg});
        }
        var commentObject = new Comment();
        commentObject.content = commentArgs.comment;
        commentObject.author = user.id;
        commentObject.article = id;
        Comment.create(commentObject).then(comment => {
            comment.prepareInsert();
            res.redirect('/article/details/' + id);
        });
    },
    addCommentPic: (req,res) => {
        if (!req.isAuthenticated()) {
            let returnUrl = '/picture/create';
            req.session.returnUrl = returnUrl;
            res.redirect('/user/login');
            return;
        }
        let user = req.user;
        let commentArgs = req.body;
        let id = req.params.id;

        let errorMsg = '';
        if (!commentArgs.comment) {
            errorMsg = 'Missing comment content!';
        }
        if (errorMsg) {
            res.render('picture/details', {error: errorMsg});
        }
        var commentObject = new Comment();
        commentObject.content = commentArgs.comment;
        commentObject.author = user.id;
        commentObject.picture = id;
        Comment.create(commentObject).then(comment => {

            comment.prepareInsertPic();
            res.redirect('/picture/details/' + id);
        });

    },
    editGet:(req,res) => {
        let id = req.params.id;
        Comment.findOne({_id:id}).populate('article').then(comment=>{
            let author = comment.author;
            let article=comment.article._id;

            if(!req.isAuthenticated()){
                let returnUrl = `/article/details/${article}`;
                req.session.returnUrl = returnUrl;
                res.redirect('/user/login');
                return;
            }

            req.user.isInRole('Admin').then(isAdmin => {
                let isUserAuthorizedForEdit = isAdmin || req.user.id==author;
                if(isUserAuthorizedForEdit){

                    res.render('article/commentEditDelete', {comment, article:comment.article});
                }else{
                    res.redirect(`/article/details/${article}`);
                }
            });
        });
    },
    editPost:(req,res) => {
        let commentArgs = req.body.comment;
        //console.log(commentArgs);
        let id = req.params.id;
        Comment.findOne({_id:id}).then(comment=>{
           comment.content = commentArgs;
            comment.save();
            let article=comment.article;
            res.redirect(`/article/details/${article}`);
        });
    },
    deleteGet:(req,res) => {
        let id = req.params.id;
        Comment.findOne({_id:id}).then(comment=>{
            let article=comment.article;
            Comment.findOneAndRemove({_id:id}).then(comment=>{
                comment.prepareDelete();
                res.redirect(`/article/details/${article}`);
            });
        });
    },
    editGetPic:(req,res) => {
        let id = req.params.id;
        Comment.findOne({_id:id}).populate('picture').then(comment =>{
            let author = comment.author;
            let pictureId = comment.picture._id;

            if(!req.isAuthenticated()){
                let returnUrl = `/picture/details/${pictureId}`;
                req.session.returnUrl = returnUrl;
                res.redirect('/user/login');
                return;
            }

            req.user.isInRole('Admin').then(isAdmin => {
                let isUserAuthorizedForEdit = isAdmin || req.user.id == author;
                if(isUserAuthorizedForEdit){

                    res.render('picture/commentEditDelete', {comment, picture:comment.picture});
                }else{
                    res.redirect(`/picture/details/${pictureId}`);
                }
            });
        });
    },
    editPostPic:(req,res) => {
        let commentArgs = req.body.comment;
        //console.log(commentArgs);
        let id = req.params.id;
        Comment.findOne({_id:id}).then(comment=>{
            comment.content = commentArgs;
            comment.save();
            let picture=comment.picture;
            res.redirect(`/picture/details/${picture}`);
        });
    },
    deleteGetPic:(req,res) => {
        let id = req.params.id;
        Comment.findOne({_id:id}).then(comment=>{
            let picture=comment.picture;
            Comment.findOneAndRemove({_id:id}).then(comment=>{
                comment.prepareDelete();
                res.redirect(`/picture/details/${picture}`);
            });
        });
    }
};