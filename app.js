const express = require('express'), 
    app = express(),
    session = require('express-session'), 
    execute = require('child_process'),
    path = require('path'), 
    fs = require('fs'),
    mongoose = require('mongoose'),
    bcrypt = require('bcrypt'), 
    port = 3000;

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

require('./db.js');

const Users = mongoose.model('Users'), 
    Questions = mongoose.model('Questions');

/* Function to remove object attributes that are equal to '' */
function cleanQuery(query) {
    for (const value in query) {
        if (query[value] === '') {
            delete query[value];
        }
    }
}

/* Middleware */
app.use(function(req, res, next) {
    //res.locals.globalSessionVar = req.session.sessionVar;
    next()
});

/* Main Homepage */
app.get('/main', function(req, res) {
    const queryResults = req.query;

    // There is data from the form(s)
    if (Object.keys(queryResults).length !== 0) {
        res.render('main', {variable: content});
    }
    // There is no data from the forms
    else {
        res.render('main', {layout: 'loggedOut.hbs'});
    }
});

// TEST ROUTE FOR LOGGED IN USER, REPLACE WITH ALTERNATE TEMPLATE ON ROUTES 
app.get('/loggedin', function(req, res) {
    const queryResults = req.query;

    // There is data from the form(s)
    if (Object.keys(queryResults).length !== 0) {
        res.render('main', {variable: content});
    }
    // There is no data from the forms
    else {
        res.render('main', {layout: 'loggedIn.hbs'});
    }
});

/* Problems List */
app.get('/problems', function(req, res) {
    const queryResults = req.query;
    console.log(req.query);
    // Strip any blank object attributes from queryResults since it would 
    // otherwise mess up the results from find 
    cleanQuery(queryResults); 

    // Display everything if there was nothing entered, otherwise display the results 
    Questions.find({}, (err, questions) => {
        res.render('problems', {layout: 'loggedIn.hbs', questionArray: questions});
    });
});

/* Individual Problem Routes */
app.get('/problems/*', function(req, res) {
    const problemName = req.url.substring(req.url.lastIndexOf('/') + 1);

    Questions.find({name: problemName}, (err, question) => {
        res.render('problem', {layout: 'loggedIn.hbs', 
            name: problemName, 
            category: question[0].category, 
            difficulty: question[0].difficulty, 
            description: question[0].description, 
            starter: question[0].starterCode
        });
    });

});

/* Individual Problem Routes Submission */
app.post('/problems/*', function(req, res) {
    const problemName = req.url.substring(req.url.lastIndexOf('/') + 1);
    var code = req.body.content;
    var language = req.body.language;
    var languageFolder = './output_' + language + '/';
    var fileName = 'Main.' + (language === 'java' ? 'java' : (language === 'python' ? 'py' : (language === 'cpp' ? 'cpp' : '')));

    fs.writeFile(languageFolder + fileName, code, function (err) {
        if (err) console.log(err);
        console.log("Successful creation of " + problemName + "\n");

        // Compilation Code here 

        Questions.find({name: problemName}, (err, question) => {
            res.render('problem', {layout: 'loggedIn.hbs', 
                name: problemName, 
                category: question[0].category, 
                difficulty: question[0].difficulty, 
                description: question[0].description, 
                starter: code 
            });
        });

    });

});

/* User Rankings */
app.get('/rankings', function(req, res) {
    const queryResults = req.query;

    // There is data from the form(s)
    if (Object.keys(queryResults).length !== 0) {
        res.render('hbsTemplate', {variable: content});
    }
    // There is no data from the forms
    else {
        res.render('hbsTemplate', {variable: content});
    }
});

/* User Profile */
app.get('/profile', function(req, res) {
    const queryResults = req.query;

    // There is data from the form(s)
    if (Object.keys(queryResults).length !== 0) {
        res.render('profile', {variable: "Hi"});
    }
    // There is no data from the forms
    else {
        res.render('profile', {layout: 'loggedIn.hbs'});
    }
});

/* Login Form */
app.get('/login', function(req, res) {
    const queryResults = req.query; 

    // There is data from the form(s)
    if (Object.keys(queryResults).length !== 0) {
        res.render('login', {variable: content});
    }
    // There is no data from the forms
    else {
        res.render('login', {layout: "loggedOut.hbs"});
    }
});

/* Register Form */
app.get('/register', function(req, res) {
    res.render('register', {layout: "loggedOut.hbs"});
});

/* Register Form Submission */
app.post('/register', function(req, res) {

    const username = req.body.username; 
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;

    // Encrypt/Hash password 
    bcrypt.hash(password, 10, function(err, hash) {
        if (err) {
            res.redirect('/register');
        }

        const userFields = {
            username : username, 
            email : email,
            password : hash,
            questions : [], 
            rating : 0
        };

        const newUser = new Users(userFields);
    
        if ( username.length == 0 || email.length == 0 || password.length == 0 || password2.length == 0) {
            res.render('register', {layout: "loggedOut.hbs", error: "Please fill out all fields!"});
        }
        else if (password !== password2) {
            res.render('register', {layout: "loggedOut.hbs", error: "Passwords do not match!"});
        }
        else if (password.length < 8) {
            res.render('register', {layout: "loggedOut.hbs", error: "Your password needs to be at least 8 characters long!"});
        }
        else {
            console.log("Validation passed for fields: ");
            console.log(userFields);
            console.log("Now checking for duplicates");
            console.log("............");
            
            Users.find( {$or: [{email: email}, {username: username}]}, (err, results) => {
    
                if (results.find(x => x.username === username)) {
                    res.render('register', {layout: "loggedOut.hbs", error: "Sorry, that username already exists"});
                }
                else if (results.find(x => x.email === email)) {
                    res.render('register', {layout: "loggedOut.hbs", error: "Sorry, that email is currently in use"});
                }
                else {
                    console.log("Successful Registration!");
                    newUser.save((err, savedUser) => {
                        if (err) { console.log("There was an error adding to the database!"); }
                        else {
                            res.redirect('/login');
                        }
                    });
                }
            });
    
        }

    })

});

app.listen(port);
