const mongoose = require('mongoose');

let tagsSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    articles: [{type: mongoose.Schema.Types.ObjectId, ref:'Article'}],
    pictures: [{type: mongoose.Schema.Types.ObjectId, ref:'Picture'}]
});

tagsSchema.method({
    prepareInsert: function () {
        let Article = mongoose.model('Article');
        for (let article of this.articles){
            Article.findById(article).then(article => {
                if (article.tags.indexOf(this.id) === -1){
                    article.tags.push(this.id);
                    article.save();
                }
            });
        }
    },

    deleteArticle: function (articleId) {
        this.articles.remove(articleId);
        this.save();
    },

    prepareInsertPic: function () {
        let Picture = mongoose.model('Picture');
        for (let picture of this.pictures){
            Picture.findById(picture).then(picture => {
                if (picture.tags.indexOf(this.id) === -1){
                    picture.tags.push(this.id);
                    picture.save();
                }
            });
        }
    },

    deletePicture: function (pictureId) {
        this.pictures.remove(pictureId);
        this.save();
    }
});

tagsSchema.set('versionKey', false);
const Tag = mongoose.model('Tag', tagsSchema);

module.exports = Tag;

module.exports.initializeTags =  function (newTags, articleId) {
    for (let newTag of newTags) {
        if(newTag){
            Tag.findOne({name: newTag}).then(tag => {
                // If is existing - insert the article in it.
                if (tag) {
                    if(tag.articles.indexOf(articleId) === -1) {
                        tag.articles.push(articleId);
                        tag.prepareInsert();
                        tag.save();
                    }
                }
                // If not - create and insert the article.
                else {
                    Tag.create({name: newTag}).then(tag => {
                        tag.articles.push(articleId);
                        tag.prepareInsert();
                        tag.save();
                    })
                }
            });
        }
    }
};

module.exports.initializeTagsPics =  function (newTags, pictureId) {
    for (let newTag of newTags) {
        if(newTag){
            Tag.findOne({name: newTag}).then(tag => {
                // If is existing - insert the picture in it.
                if (tag) {
                    if(tag.pictures.indexOf(pictureId) === -1) {
                        tag.pictures.push(pictureId);
                        tag.prepareInsert();
                        tag.save();
                    }
                }
                // If not - create and insert the picture.
                else {
                    Tag.create({name: newTag}).then(tag => {
                        tag.pictures.push(pictureId);
                        tag.prepareInsert();
                        tag.save();
                    })
                }
            });
        }
    }
};