const mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    articles: [{type: mongoose.Schema.Types.ObjectId, ref:'Article'}],
    videos: [{type: mongoose.Schema.Types.ObjectId, ref:'Video'}],
    pictures: [{type: mongoose.Schema.Types.ObjectId, ref:'Picture'}]
});

categorySchema.method({
    prepareDelete: function () {
        let Article = mongoose.model('Article');
        for (let article of this.articles){
            Article.findById(article).then(article => {
                article.prepareDelete();
                article.remove();
            })
        }
    },

    prepareDeletePic: function () {
        let Picture = mongoose.model('Picture');
        for (let picture of this.pictures){
            Picture.findById(picture).then(picture => {
                picture.prepareDeletePic();
                picture.remove();
            })
        }
    }
});

categorySchema.set('versionKey', false);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
