const userController = require('./../controllers/user');
const articleController = require('./../controllers/article');
const pictureController = require('./../controllers/picture');
const homeController = require('./../controllers/home');
const adminController = require('./../controllers/admin/admin');
const tagController = require('./../controllers/tag');
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
    app.get('/category/:id', homeController.listCategoryArticles);
    app.get('/category/:id', homeController.listCategoryPictures);

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
    app.post('/picture/create', pictureController.createPost);

    app.get('/article/create', articleController.createGet);
    app.post('/article/create', upload.single('myFile'),articleController.createPost);

    app.get('/article/details/:id', articleController.details);
    app.get('/picture/details/:id', pictureController.details);

    app.get('/article/edit/:id', articleController.editGet);
    app.post('/article/edit/:id', articleController.editPost);

    app.get('/article/delete/:id', articleController.deleteGet);
    
    app.post('/', articleController.searchArticleGet);

    app.post('/article/delete/:id', articleController.deletePost);

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

