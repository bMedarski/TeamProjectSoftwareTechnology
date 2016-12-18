const mongoose = require('mongoose');

let videoSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    videoLink:{type: String, required: true},
    category: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category'},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref:'Comment'}],
    date: {type: Date, default: Date.now()}
});

videoSchema.method({
    prepareInsert: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            user.videos.push(this.id);
            user.save();
        });

        let Category = mongoose.model('Category');
        Category.findById(this.category).then(category => {
            // If the article is created without category - if there are no categories.
            if (category) {
                category.videos.push(this.id);
                category.save();
            }
        });
    },

    prepareDelete: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            // If user is not deleted already - when we delete from User.
            if(user){
                user.videos.remove(this.id);
                user.save();
            }
        });

        let Category = mongoose.model('Category');
        Category.findById(this.category).then(category => {
            // If the category is not already deleted.
            if (category) {
                category.videos.remove(this.id);
                category.save();
            }
        });
    },
});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;
