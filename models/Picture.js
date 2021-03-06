const mongoose = require('mongoose');

let pictureSchema = mongoose.Schema({
    title: {type: String, required: true},
    img:{data:Buffer, contentType:String, path:String, required: false, name:String},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    category: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category'},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref:'Comment'}],
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
            if (category) {
                category.pictures.push(this.id);
                category.save();
            }
        });
    },
    prepareDelete: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            if (user) {
                user.pictures.remove(this.id);
                user.save();
            }
        });
        let Category = mongoose.model('Category');
        Category.findById(this.category).then(category => {
            if (category) {
                category.pictures.remove(this.id);
                category.save();
            }
        })
    }
});

const Picture = mongoose.model('Picture', pictureSchema);
module.exports = Picture;
