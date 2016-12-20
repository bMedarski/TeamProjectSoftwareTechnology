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
        let userName = user.fullName;
        let userId = user.id;
        let commentArgs = req.body;
        let id = req.params.id;
        //console.log(id);
        //console.log(userName);
        //console.log(commentArgs);
        //console.log(id);
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

        //console.log(commentObject);
        Comment.create(commentObject).then(comment => {
            /*let idArticle = comment.article;
             let userId = comment.author;*/
            //console.log(idArticle);
            //console.log(userId);
            //console.log(comment.id);
            /*Article.update(
             { "_id" : id   },
             {
             "$push" : {
             "comments" : comment.id
             }
             }
             );*/
            /*Article.find({_id:id}).then(article => {
             if (article) {
             console.log(article);
             console.log(comment.id);
             article.comments.add(comment.id);
             //console.log(this.id);
             article.save();
             }
             });*/
            /* User.find({_id:userId}).then(user =>{
             if (user) {
             console.log(user);
             //user.comments.push(comment.id);
             //console.log(this.id);
             //user.save();
             }
             });*/
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
        if(!req.isAuthenticated()){
            let returnUrl = `/article/details/comment/${id}`;
            req.session.returnUrl = returnUrl;
            res.redirect('/user/login');
            return;
        }
        Comment.findOne({_id:id}).populate('article').then(comment=>{
            let author = comment.author;
            let article=comment.article;
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
        console.log(commentArgs);
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
    }
};