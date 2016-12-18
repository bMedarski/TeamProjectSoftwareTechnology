
const mongoose = require('mongoose');

let pictureSchema = mongoose.Schema({
    title: {type: String, required: true},
    img:{data:Buffer, contentType:String, path:String, required: false, name:String},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    category: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category'},
    comments: {type: mongoose.Schema.Types.ObjectId, ref:'Comment'},
    //tags: [{type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Tag'}],
    date: {type: Date, default: Date.now()}
});

pictureSchema.method({
    prepareInsert: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            user.pictures.push(this.id);
            user.save();
        });

        let Category = mongoose.model('Category');
        Category.findById(this.category).then(category => {
            // If the picture is created without category - if there are no categories.
            if (category) {
                category.pictures.push(this.id);
                category.save();
            }
        });

        /*let Tag = mongoose.model('Tag');
         for (let tagId of this.tags){
         Tag.findById(tagId).then(tag => {
         if (tag) {
         tag.pictures.push(this.id);
         tag.save();
         }
         });
         }*/
    },

    prepareDelete: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            // If user is not deleted already - when we delete from User.
            if (user) {
                user.pictures.remove(this.id);
                user.save();
            }
        });

        let Category = mongoose.model('Category');
        Category.findById(this.category).then(category => {
            // If the category is not already deleted.
            if (category) {
                category.pictures.remove(this.id);
                category.save();
            }
        });

        //    let Tag = mongoose.model('Tag');
        //    for (let tagId of this.tags){
        //        Tag.findById(tagId).then(tag => {
        //            if (tag) {
        //               tag.pictures.remove(this.id);
        //                tag.save();
        //            }
        //         });
        //     }
        //  },

        //   deleteTag: function (tagId){
        //      this.tags.remove(tagId);
        //     this.save();
        // }
    }
});

const Picture = mongoose.model('Picture', pictureSchema);
module.exports = Picture;
