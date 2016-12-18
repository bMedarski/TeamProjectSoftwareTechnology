const mongoose = require('mongoose');

let commentSchema = mongoose.Schema({
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    article: {type: mongoose.Schema.Types.ObjectId, ref:'Article'},
    picture: {type: mongoose.Schema.Types.ObjectId, ref:'Picture'},
    date: {type: Date, default: Date.now()}
});

commentSchema.method({
    prepareInsert: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            user.comments.push(this.id);
            user.save();
        });
        let Article = mongoose.model('Article');
        Article.findById(this.article).then(article => {
            article.comments.push(this.id);
            article.save();
        });
    },

    prepareDelete: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            // If user is not deleted already - when we delete from User.
            if(user){
                user.comments.remove(this.id);
                user.save();
            }
        });
    },

    prepareInsertPic: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            user.comments.push(this.id);
            user.save();
        });
        let Picture = mongoose.model('Picture');
        Picture.findById(this.picture).then(picture => {
            picture.comments.push(this.id);
            picture.save();
        });
    },

    prepareDeletePic: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            // If user is not deleted already - when we delete from User.
            if(user){
                user.comments.remove(this.id);
                user.save();
            }
        });
    }
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
