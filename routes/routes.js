const express = require('express');
const router = express.Router();
const User =require('../models/users');

const multer =require('multer');
const fs = require('fs');

// UPload image..
var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./uploads");
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});

// middleware..

var upload =multer({
    storage:storage,
}).single("image");

// Insert an user into databse..
router.post('/add',upload,(req,res)=>{
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        image:req.file.filename, 
    });

    user.save()
    .then(savedUser => {
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        res.redirect("/");
    })
    .catch(error => {
        res.json({ message: error.message, type: 'danger' });
    }); 
});

// Get all users route
router.get('/', async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('index', {
            title: "Home Page.",
            users: users
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.get('/',(req,res)=>{
    res.render('index',{title:"Home Page"})
});

router.get('/add',(req,res)=>{
    res.render('add_users',{title:"Add user"})
});

router.get('/about',(req,res)=>{
    res.send('about',{title:'About page'});
})


// Edit an user route..
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id)
        .then(user => {
            if (user === null) {
                res.redirect('/');
            } else {
                res.render('edit_users', {
                    title: 'Edit User',
                    user: user,
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.redirect('/');
        });
});


router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;

        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        }).exec();

        if (!result) {
            // Handle case where no user was found with the given id
            res.json({ message: 'User not found', type: 'danger' });
            return;
        }

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!'
        };
        res.redirect('/');
    } catch (err) {
        // Handle any errors that occur during the update process
        res.json({ message: err.message, type: 'danger' });
    }
});


// Delete user 
// const User = require('./user');

// const User = require('./user');

router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const result = await User.findByIdAndDelete(id);

        if (result && result.image !== '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});


module.exports =router;
