const Article = require('mongoose').model('Article');
const Picture = require('mongoose').model('Picture');
const User = require('mongoose').model('User');
const Category = require('mongoose').model('Category');
const Comment = require('mongoose').model('Comment');
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
        var commentObject  = new Comment();
        commentObject.content = commentArgs.comment;
        commentObject.author = user.id;
        commentObject.article = id;

        //console.log(commentObject);
        Comment.create(commentObject).then(comment =>{
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


    }
};