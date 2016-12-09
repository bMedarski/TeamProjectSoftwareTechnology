const Picture = require('mongoose').model('Picture');
const Category = require('mongoose').model('Category');
const Tag = require('mongoose').model('Tag');
const initializeTagsPics = require('mongoose').model('Tag').initializeTagsPics;
var fs = require("fs");
module.exports = {

    getPictures: (req, res) => {
        Picture.find({}).sort({date: -1}).populate('author tags').then(pictures => {
            /*date = [];
            for(let i=0;i<pictures.length; i++){
                date.push(pictures[i].date);
            }
            for(let i=0;i<pictures.length; i++){
                pictures[i].created = moment(date[i]).format("H:mm, DD-MMM-YYYY");
            }*/
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
        /*if (!pictureArgs.title) {
            errorMsg = 'Invalid title!';
        } else if (!pictureArgs.showPic) {
            errorMsg = 'Please upload an image!';
        }*/

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
        pictureObject.title = req.body.title;
        pictureObject.author = req.user.id;
        pictureObject.tags = [];
        Picture.create(pictureObject).then(picture => {
            /*// Get the tags from the input, split it by space or semicolon,
            // then remove empty entries.
            let tagNames = pictureObject.tagNames.split(/\s+|,/).filter(tag => {
                return tag
            });
            initializeTagsPics(tagNames, picture.id);*/

            picture.prepareInsert();
            res.redirect('/home/picture');
        });

    },


    details: (req, res) => {
        let id = req.params.id;

        Picture.findById(id).populate('author tags').then(picture => {
            if (!req.user){
                res.render('picture/details', { picture: picture, isUserAuthorized: false});
                return;
            }

            req.user.isInRole('Admin').then(isAdmin => {
                let isUserAuthorized = isAdmin || req.user.isAuthor(picture);

                res.render('picture/details', { picture: picture, isUserAuthorized: isUserAuthorized});
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
                    res.redirect('/');
                    return;
                }
                Category.find({}).then(categories =>{
                    picture.categories = categories;

                    picture.tagNames = picture.tags.map(tag => {return tag.name});
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
        } else if (!pictureArgs.showPic) {
            errorMsg = 'Please upload a picture!'
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
                picture.showPic = pictureArgs.showPic;

                let newTagNames = pictureArgs.tags.split(/\s+|,/).filter(tag => {return tag});

                // Get me the old picture's tags which are not
                // re-entered.
                let oldTags = picture.tags
                    .filter(tag => {
                        return newTagNames.indexOf(tag.name) === -1;
                    });

                for(let tag of oldTags){
                    tag.deletePicture(picture.id);
                    picture.deleteTag(tag.id);
                }

                initializeTagsPics(newTagNames, picture.id);

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

                picture.tagNames = picture.tags.map(tag => {return tag.name});
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
                    picture.prepareDeletePic();
                    res.redirect('/');
                });
            });
        });
    }
};

