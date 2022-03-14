const express = require('express')
const { engine } = require('express-handlebars');
const mongoose = require('mongoose')
const Resume = require('./models/Resume')
const bcrypt = require('bcryptjs')
const Home = require('./models/Home')
const { ensureAuth } = require('./config/auth')
const User = require('./models/User')
let ObjectID = require('mongodb').ObjectID;
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

//passport config
require('./config/passport')(passport);

const app = express()
const port = 3000

const path = require('path')
    //const hbs = require('hbs')

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/'
}));

app.set('view engine', 'hbs');
//session
app.use(session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true,

    }))
    //passport middleware
app.use(passport.initialize());
app.use(passport.session());
//flash
app.use(flash())
    //Global var
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error')
    next();
})

let bodyparser = require('body-parser')
app.use(bodyparser.urlencoded({ extended: true }));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//mongoDB
const db = require('./config/keys').MongoURI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDb connected'))
    .catch(err => console.log(err));

let workE = [];

let blog = [{
        id: 1,
        title: "Front End road map",
        description: "road map front"
    },
    {
        id: 2,
        title: "Back End road map",
        description: "road map back"
    }
];

let education = [{
        id: 1,
        title: "khayyam uni",
        description: "khayyam university is the first university "
    }


]




app.get('/', (req, res) => {

    Home.find()
        .then(user => {
            let length = user.length;
            res.render('home', { users: user[length - 1] })
        })




})

app.get('/about', (req, res) => res.render('about'))


app.get('/resume', (req, res) => {

    Resume.find()
        .then(resum => {
            res.render('resume', { workE: resum })

        })
        .catch(err => console.log(err))
})

app.get('/resum/:id', (req, res) => {
    let educ = education.filter(obj => obj.id == req.params.id)[0];
    res.render('educationD', { educ: educ })
})

app.get('/resume/:id', function(req, res) {

    let newObjectId = new ObjectID(req.params.id)

    Resume.find({ _id: newObjectId })

    .then(resum => {
        res.send(resum[0].description)

    })

});
app.delete('/resume', (req, res) => {

    let deletN = req.body.titleD;
    Resume.findOne({ title: deletN }).deleteOne().exec()



    res.redirect('/resume')

})




app.get('/blog', (req, res) => res.render('blog', { blog: blog }))
app.get('/blog/:id', (req, res) => {
    let findId = blog.filter(obj => obj.id == req.params.id)[0];
    res.render('blogD', { findId: findId })

})
app.get('/contact', (req, res) => res.render('contact'))

app.get('/manage', ensureAuth, (req, res) => {
    res.render('Manage', { name: req.user.name })
})


app.post('/resume', (req, res) => {
    const title = req.body.titleNewWork;

    const description = req.body.desNewWork;

    Resume.findOne({ title: title })
        .then(resum => {
            if (!resum) {
                const newRes = new Resume({ title, description });
                newRes.save()

                .then(resum => {

                        res.redirect('/resume')


                    })
                    .catch(err => console.log(err))
            } else {
                res.send({ msg: 'this is exist' })
            }

        })


})
app.post('/blog', (req, res) => {
    let max = 0;
    blog.forEach(obj => {
        if (obj.id > max) {
            max = obj.id;
        }
    });
    let newBlog = {
        id: max + 1,
        title: req.body.titleNewBlog,
        description: req.body.desNewBlog
    };
    if (!Boolean(newBlog.title) || !Boolean(newBlog.description)) {
        res.redirect('/manage')
    } else {


        const hass = Boolean(blog.filter(obj => obj.title == newBlog.title)[0]);
        if (!hass) {
            blog.push(newBlog);

        } else {
            res.status('400').json({ msg: 'that\'s exsit insert other' })
        }
    }
    res.redirect('/blog')
})



app.delete('/blog', (req, res) => {
    const exitB = Boolean(req.body.titleB);
    if (exitB) {
        let deletB = blog.filter(obj => obj.title == req.body.titleB)[0]
        blog.splice(blog.indexOf(deletB), 1)
        res.redirect("/blog")
    }
    res.redirect('/manage')

})

app.put('/resume', function(req, res) {
    let find = req.body.nameResume;
    Resume.find({ title: find })
        .then((item) => {
            if (item) {


                Resume.updateOne({ title: find }, {
                        title: req.body.editTitle,
                        description: req.body.editDesc

                    })
                    .then(() => {
                        res.redirect('/resume')
                    })
            } else {
                res.send({ msg: "this resume is not exist please insert then edit" })
            }
        })


});


app.put('/blog', (req, res) => {
    const exitB = Boolean(blog.filter(obj => obj.title == req.body.nameBlog)[0])
    if (exitB) {
        const exitBlog = Boolean(blog.filter(obj => obj.title == req.body.editTitle)[0])

        if (!exitBlog) {


            let findB = blog.filter(obj => obj.title == req.body.nameBlog)[0]
            findB.title = req.body.editTitle;
            findB.description = req.body.editDesc;
            blog.splice(blog.indexOf(findB), 1, findB)
            res.redirect("/blog")

        } else {

            res.status('404').json({ msg: "that/'s editing exit" })
        }

    } else {
        res.status("400").json({ msg: "that\'s not exit please insert then edit" })
    }

})




app.post('/', (req, res) => {

    let name = req.body.newName;
    let ability = req.body.ability;
    Home.findOne({ name: name })
        .then(user => {
            if (user) {
                Home.findOne(user).deleteOne().exec()

                .then(() => {
                    const newUser = new Home({ name, ability });
                    newUser.save()

                })

                .then(resum => {

                        res.redirect('/')


                    })
                    .catch(err => console.log(err))
            } else {
                const newUser = new Home({ name, ability });
                newUser.save()
            }

        })



})




app.get('/login', (req, res) => res.render('index'));

app.get('/dashboard', ensureAuth, (req, res) => res.render('dashboard', { name: req.user.name }));

app.get('/users/login', (req, res) => res.render('login'))
    //register
app.get('/users/register', (req, res) => res.render('register'))

app.post('/users/register', (req, res) => {
        const { name, email, password, password2 } = req.body;
        let errors = [];
        //console.log(req.body);
        //All feilds is required
        if (!name || !email || !password || !password2) {
            errors.push({ msg: 'All feilds is required' })
        }
        //match password
        if (password !== password2) {
            errors.push({ msg: "confirm password is not match" })
        }
        //check complixity of password
        if (password.length < 6) {
            errors.push({ msg: "Your password should be at least 6 characters" });
        }
        if (errors.length > 0) {
            res.render("register", { errors, name, email, password, password2 })
        } else {
            User.findOne({ email: email })
                .then(user => {
                    if (user) {
                        errors.push({ msg: 'this email already exits' });
                        res.render('register', { errors, name, email, password, password2 })
                    } else {
                        const newUser = new User({ name, email, password })

                        bcrypt.genSalt(10, (err, salt) => {
                            if (err) throw err;

                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash
                                newUser.save()
                                    .then(user => {
                                        req.flash('success_msg', 'You are now registered')
                                        res.redirect('login')
                                    })
                                    .catch(err => console.log(err))

                            })

                        })

                    }
                })
                .catch(err => console.log(err))
        }

    })
    //login proccess
app.post('/users/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);

})

//logout proccess
app.get('/users/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'you are logout')
    res.redirect('/')
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))