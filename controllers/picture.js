const Picture = require('mongoose').model('Picture');
const Category = require('mongoose').model('Category');
const Comment = require('mongoose').model('Comment');
const User = require('mongoose').model('User');
const moment = require('moment');
var fs = require("fs");
module.exports = {
    searchPictureGet: (req, res) => {
        let searchArgs = req.body.search;
        Picture.find({ title: { $regex: searchArgs, $options: 'i' } }).sort({date: -1}).populate('author').then(picture => {
            res.render('home/searchPicture', {pictures:picture});
        });
    },
    getPictures: (req, res) => {
        Picture.find({}).sort({date: -1}).then(pictures => {
            Category.find({}).then(categories => {
                res.render('home/picture', {pictures: pictures,categories: categories});
            });
        });
    },
    createGet: (req, res) => {
        if (!req.isAuthenticated()){
            let returnUrl = '/picture/create';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }
        Category.find({}).then(categories => {
            res.render('picture/create', {categories: categories});
        });
    },
    createPost: (req, res) => {
        if (!req.isAuthenticated()) {
            let returnUrl = '/picture/create';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }
        let pictureArgs = req.body;
        let errorMsg = '';
        if (errorMsg) {
            res.render('picture/create', {error: errorMsg});
            return;
        }
        var pictureObject = new Picture();
        if(req.file){
            pictureObject.img.data = fs.readFileSync(req.file.path);
            pictureObject.img.path=req.file.path;
            pictureObject.img.contentType='image/png';
            pictureObject.img.name=req.file.filename;
        }
        pictureObject.category = req.body.category;
        pictureObject.title = req.body.title;
        pictureObject.author = req.user.id;
        Picture.create(pictureObject).then(picture => {
            picture.prepareInsert();
            res.redirect('/home/picture');
        });

    },
    details: (req, res) => {
        let id = req.params.id;
        Picture.findById({_id:id}).populate('author').then(picture => {
            //console.log(picture);
            let date = moment(picture.date).format("H:mm, DD-MMM-YYYY");
            Comment.find({picture:picture.id}).populate('author').then(comment =>{
                User.findOne({_id:comment.author}).then(user => {
                    //console.log(user);
                    if (!req.user){
                        res.render('picture/details', { picture: picture, comments:comment, author:user, date:date,isUserAuthorized: false});
                        return;
                    }
                    req.user.isInRole('Admin').then(isAdmin => {
                        let isUserAuthorized = isAdmin || req.user.isAuthor(picture);

                        res.render('picture/details', { picture: picture, comments:comment, author:user,date:date, isUserAuthorized: isUserAuthorized});
                    });
                });
            });
        });
    },
    editGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/picture/edit/${id}`;
            req.session.returnUrl = returnUrl;
            res.redirect('/user/login');
            return;
        }
        Picture.findById(id).populate('tags').then(picture => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(picture)) {
                    res.redirect('/home/picture');
                    return;
                }
                Category.find({}).then(categories =>{
                    picture.categories = categories;
                    res.render('picture/edit', picture)
                });
            });
        });
    },
    editPost: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/picture/edit/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }
        let pictureArgs = req.body;
        let errorMsg = '';
        if (!pictureArgs.title){
            errorMsg = 'picture title cannot be empty!';
        }
        if(errorMsg) {
            res.render('picture/edit', {error: errorMsg})
        } else {
            Picture.findById(id).populate('category tags').then(picture => {
                if (picture.category.id !== pictureArgs.category){
                    picture.category.pictures.remove(picture.id);
                    picture.category.save();
                }
                picture.category = pictureArgs.category;
                picture.title = pictureArgs.title;
                picture.img.data = fs.readFileSync(req.file.path);
                picture.img.path=req.file.path;
                picture.img.name=req.file.filename;
                picture.save((err) => {
                    if(err) {
                        console.log(err.message);
                    }
                    Category.findById(picture.category).then(category => {
                        if(category.pictures.indexOf(picture.id) === -1){
                            category.pictures.push(picture.id);
                            category.save();
                        }
                        res.redirect(`/picture/details/${id}`);
                    })
                });
            });
        }
    },
    deleteGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/picture/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }
        Picture.findById(id).populate('category tags').then(picture => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(picture)) {
                    res.redirect('/');
                    return;
                }
                res.render('picture/delete', picture)
            });
        });
    },
    deletePost: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/picture/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }
        Picture.findById(id).then(picture => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(picture)) {
                    res.redirect('/');
                    return;
                }
                Picture.findOneAndRemove({_id: id}).then(picture => {
                    picture.prepareDelete();
                    res.redirect('/home/picture');
                });
            });
        });
    }
};