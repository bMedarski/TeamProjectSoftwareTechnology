const userController = require('./../controllers/user');
const articleController = require('./../controllers/article');
const pictureController = require('./../controllers/picture');
const homeController = require('./../controllers/home');
const adminController = require('./../controllers/admin/admin');
const tagController = require('./../controllers/tag');
const commentController = require('./../controllers/comment');
const videoController = require('./../controllers/video');

const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null,Date.now()+file.originalname);
    }
});

module.exports = (app) => {
    var upload = multer({storage:storage});

    app.get('/', homeController.index);
    app.get('/home/picture', pictureController.getPictures);
    app.get('/home/video', videoController.getVideo);


    app.get('/category/:id', homeController.listCategoryArticles);
    app.get('/category/picture/:id', homeController.listCategoryPictures);
    app.get('/category/video/:id', homeController.listCategoryVideos);

    app.get('/tag/:name', tagController.listArticlesByTag);
    app.get('/tag/:name', tagController.listPicturesByTag);

    app.get('/user/register', userController.registerGet);
    app.post('/user/register', userController.registerPost);

    app.get('/user/login', userController.loginGet);
    app.post('/user/login', userController.loginPost);

    app.get('/user/details', userController.detailsGet);
    app.post('/user/details',upload.single('avatar'), userController.detailsPost);

    app.get('/user/logout', userController.logout);

    app.get('/picture/create', pictureController.createGet);
    app.post('/picture/create', upload.single('showPic'), pictureController.createPost);

    app.get('/article/create', articleController.createGet);
    app.post('/article/create', upload.single('myFile'),articleController.createPost);

    app.get('/video/create', videoController.createGet);
    app.post('/video/create', videoController.createPost);

    app.get('/article/details/:id', articleController.details);
    app.get('/picture/details/:id', pictureController.details);
    app.get('/video/details/:id', videoController.details);

    app.post('/article/details/:id', commentController.addComment);
    app.post('/picture/details/:id', commentController.addCommentPic);

    app.get('/article/edit/:id', articleController.editGet);
    app.post('/article/edit/:id', articleController.editPost);

    app.get('/picture/edit/:id', pictureController.editGet);
    app.post('/picture/edit/:id', upload.single('showPic'), pictureController.editPost);

    app.get('/picture/delete/:id', pictureController.deleteGet);
    app.post('/picture/delete/:id', pictureController.deletePost);

    app.get('/article/delete/:id', articleController.deleteGet);
    app.post('/article/delete/:id', articleController.deletePost);

    app.post('/home/video', videoController.searchVideoGet);
    app.post('/home/picture', pictureController.searchPictureGet);
    app.post('/', articleController.searchArticleGet);

    app.get('/article/details/comment/:id', commentController.editGet);
    app.get('/article/comment/delete/:id', commentController.deleteGet);
    app.post('/article/comment/edit/:id', commentController.editPost);

    app.get('/picture/details/comment/:id', commentController.editGetPic);
    app.get('/picture/comment/delete/:id', commentController.deleteGetPic);
    app.post('/picture/comment/edit/:id', commentController.editPostPic);

    app.use((req, res, next) => {
        if (req.isAuthenticated()){
            req.user.isInRole('Admin').then(isAdmin=>{
                if(isAdmin){
                    next();
                } else{
                    res.redirect('/');
                }
            })
        } else {
            res.redirect('/user/login');
        }
    });

    app.get('/admin/user/all', adminController.user.all);

    app.get('/admin/user/edit/:id', adminController.user.editGet);
    app.post('/admin/user/edit/:id', adminController.user.editPost);

    app.get('/admin/user/delete/:id', adminController.user.deleteGet);
    app.post('/admin/user/delete/:id', adminController.user.deletePost);

    app.get('/admin/category/all', adminController.category.all);

    app.get('/admin/category/create', adminController.category.createGet);
    app.post('/admin/category/create', adminController.category.createPost);

    app.get('/admin/category/edit/:id', adminController.category.editGet);
    app.post('/admin/category/edit/:id', adminController.category.editPost);

    app.get('/admin/category/delete/:id', adminController.category.deleteGet);
    app.post('/admin/category/delete/:id', adminController.category.deletePost);
};

