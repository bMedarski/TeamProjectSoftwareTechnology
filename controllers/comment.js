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
        let commentArgs = req.body;
        let id = req.params.id;
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
        Comment.create(commentObject).then(comment =>{
            comment.prepareInsert();
            res.redirect('/article/details/' + id);
        });
    }
};