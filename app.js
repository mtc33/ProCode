const express = require('express'),
    app = express(),
    session = require('express-session'),
    newProcess = require('child_process'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    passport = require('passport'),
    port = 80;

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.use(session({ secret: 'sessionIDSigningKey', saveUninitialized: false, resave: false }));
app.use(passport.initialize());
app.use(passport.session());

require('./db.js');
const Users = mongoose.model('Users'),
    Questions = mongoose.model('Questions');

class RegistrationInfo {
    constructor(username, email, password, questions, rating) {
        this.username = username; 
        this.email = email; 
        this.password = password; 
        this.questions = questions;
        this.rating = rating;
    }
}

class LoginInfo {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

class problemAttempt {
    constructor(problemName, result, language) {
        this.problemName = problemName;
        this.result = result;
        this.language = language;
    }
}

/* Passport Authentication */
passport.serializeUser(function (user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
    done(null, user_id);
});

/* Function to remove object attributes that are equal to '' */
function cleanQuery(query) {
    for (const value in query) {
        if (query[value] === '') {
            delete query[value];
        }
    }
}

/* Middleware */
app.use(function (req, res, next) {
    next();
});

/* Main Homepage */
app.get('/', function (req, res) {
    res.render('main', req.isAuthenticated() ? { layout : 'loggedIn.hbs', username : req.user} : { layout : 'loggedOut.hbs'});
});

/* Problems List */
app.get('/problems', function (req, res) {
    const queryResults = req.query;
    /* Strip any blank object attributes */
    cleanQuery(queryResults);

    // Display everything if there was nothing entered, otherwise display the results 
    Questions.find(queryResults, (err, dbResults) => {
        res.render('problems', req.isAuthenticated() ? { layout : 'loggedIn.hbs', questions : dbResults, username : req.user} : { layout : 'loggedOut.hbs', questions : dbResults});
    });
});

/* Individual Problem Routes */
app.get('/problems/*', function (req, res) {
    const problemName = req.url.substring(req.url.lastIndexOf('/') + 1);

    Questions.find({ name: problemName }, (err, dbResults) => {
        res.render('problem', {
            layout: req.isAuthenticated() ? 'loggedIn.hbs' : 'loggedOut.hbs',
            name: problemName,
            category: dbResults[0].category,
            difficulty: dbResults[0].difficulty,
            description: dbResults[0].description,
            starter: dbResults[0].starterCode,
            username : req.isAuthenticated() ? req.user : ''
        });
    });

});

/* Individual Problem Routes Submission */
app.post('/problems/*', function (req, res) {
    const problemName = req.url.substring(req.url.lastIndexOf('/') + 1);
    var codeContent = req.body.content;
    var language = req.body.language;

    var languageFolder = './output_' + language + '/';
    var fileName = 'Solution.' + (language === 'java' ? 'java' : (language === 'python' ? 'py' : (language === 'cpp' ? 'cpp' : '')));

    var cmd_compile = (language === 'java' ? 'javac' : (language === 'cpp' ? 'g++' : 'python'));
    var args_compile = (language === 'java' ? ['Main.java', 'TestRunner.java'] : (language === 'cpp' ? [fileName, '-o Solution'] : [fileName]));
    var cmd_run = (language === 'java' ? 'java' : (language === 'cpp' ? './Solution' : (language === 'python' ? 'python' : '')));
    var args_run = (language === 'java' ? ['Main', problemName] : (language === 'python' ? [fileName] : ['']));

    if (language === 'cpp') {
        Questions.find({ name: problemName }, (err, dbResults) => {
            res.render('problem', {
                layout: req.isAuthenticated() ? 'loggedIn.hbs' : 'loggedOut.hbs',
                name: problemName,
                category: dbResults[0].category,
                difficulty: dbResults[0].difficulty,
                description: dbResults[0].description,
                starter: codeContent,
                username : req.isAuthenticated() ? req.user : '',
                output: "C++ support is still in progress!"
            });
        });
    }
    else if (language === 'python') {
        Questions.find({ name: problemName }, (err, dbResults) => {
            res.render('problem', {
                layout: req.isAuthenticated() ? 'loggedIn.hbs' : 'loggedOut.hbs',
                name: problemName,
                category: dbResults[0].category,
                difficulty: dbResults[0].difficulty,
                description: dbResults[0].description,
                starter: codeContent,
                username : req.isAuthenticated() ? req.user : '',
                output: "Python support is still in progress!"
            });
        });
    }
    else {

        fs.writeFile(languageFolder + fileName, codeContent, function (err) {
            if (err) console.log(err);
            console.log("Problem " + problemName + " submitted in " + language + "\n");

            /* TODO - Put compilation code here */
            console.log("Child Process Command 1:", cmd_compile, args_compile);
            console.log("Child Process Command 2:", cmd_run, args_run);

            const compile = newProcess.spawn(cmd_compile, args_compile, { cwd: languageFolder });

            compile.stdout.on('data', stdout => {
                console.log("Output from Compilation: ", stdout.toString());
            });

            compile.stderr.on('data', stderr => {
                console.log("Output from Compilation (Error): ", stderr.toString());
            });

            compile.on('close', code => {
                console.log("Compile Closing Code: ", code.toString());
                if (code === 0) {
                    const execute = newProcess.spawn(cmd_run, args_run, { cwd: languageFolder });

                    execute.stdout.on('data', stdout => {

                        const attempt = new problemAttempt(problemName, stdout.toString(), language);
                        if (req.isAuthenticated()) {
                            Users.findOneAndUpdate({ username : req.user }, { $push : { questions : { $each : [attempt], $position: 0 }}, $inc : {rating : 1}}, (err, res) => {
                                if (err) console.log("MongoDB Update Error");
                                console.log("Succesfully saved problem attempt into user");
                            });
                        }

                        console.log("Execution Output: ", stdout.toString());
                        Questions.find({ name: problemName }, (err, dbResults) => {
                            res.render('problem', {
                                layout: req.isAuthenticated() ? 'loggedIn.hbs' : 'loggedOut.hbs',
                                name: problemName,
                                category: dbResults[0].category,
                                difficulty: dbResults[0].difficulty,
                                description: dbResults[0].description,
                                starter: codeContent,
                                username : req.isAuthenticated() ? req.user : '',
                                output: stdout.toString()
                            });
                        });
                    });

                    execute.stderr.on('data', stderr => {
                        console.log("Execution Error Output", stderr.toString());
                    });

                    execute.on('close', code => {
                        console.log("Execute Closing Code: ", code.toString());
                    });

                }
                else {
                    const attempt = new problemAttempt(problemName, "Compilation Error", language);
                    if (req.isAuthenticated()) {
                        Users.findOneAndUpdate({ username : req.user }, { $push : { questions : { $each : [attempt], $position: 0 }}, $inc : {rating : 1}}, (err, res) => {
                            if (err) console.log("MongoDB Update Error");
                            console.log("Succesfully saved problem attempt into user");
                        });
                    }
                    Questions.find({ name: problemName }, (err, dbResults) => {
                        res.render('problem', {
                            layout: req.isAuthenticated() ? 'loggedIn.hbs' : 'loggedOut.hbs',
                            name: problemName,
                            category: dbResults[0].category,
                            difficulty: dbResults[0].difficulty,
                            description: dbResults[0].description,
                            starter: codeContent,
                            username : req.isAuthenticated() ? req.user : '',
                            output: "Compilation Error"
                        });
                    });

                }
            });

        });

        

    }

});

/* User Rankings */
app.get('/rankings', function (req, res) {
    const queryResults = req.query;
    /* Strip any blank object attributes */
    cleanQuery(queryResults);

    Users.find(queryResults).sort({'rating' : -1}).exec(function (err, dbResults) {
        res.render('rankings', req.isAuthenticated() ? { layout : 'loggedIn.hbs', users : dbResults, username : req.user} : { layout : 'loggedOut.hbs', users : dbResults});
    });
});

/* User Profile */
app.get('/profile', function (req, res) {
    if (req.isAuthenticated()) {
        Users.find({ username : req.user }, (err, dbResults) => {
            res.render('profile', { layout : 'loggedIn.hbs', username : dbResults[0].username, email : dbResults[0].email, rating : dbResults[0].rating, attempts : dbResults[0].questions });
        });
    }
    else {
        res.redirect('/');
    }
});

/* Logout Button */
app.get('/logout', function (req, res) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

/* Login Form */
app.get('/login', function (req, res) {
    res.render('login', { layout: "loggedOut.hbs" });
});

/* Login Form Submission */
app.post('/login', function (req, res) {

    const email = req.body.email;
    const password = req.body.password;

    const L = new LoginInfo(email, password);

    bcrypt.hash(L.password, 10, function (err, hash) {
        if (err) res.redirect('/login');

        Users.find({ email : L.email }, (err, results) => {
            if (err) console.log("Mongoose Error: Login Email");

            if (results.find(x => x.email === L.email)) {
                console.log("Login Attempt: Found Email");

                bcrypt.compare(L.password, results[0].password, (err, passwordMatches) => {
                    if (err) console.log("Mongoose Error: Login Password");

                    if (passwordMatches) {
                        console.log("Login Attempt: Password Correct");

                        req.login(results[0].username, function(err) {
                            res.redirect('/');
                        });
                    }
                    else {
                        console.log("Login Attempt: Incorrect Password");
                        res.render('login', { layout: "loggedOut.hbs", error: "Your password is incorrect" });
                    }
                });
            }
            else {
                console.log("Login Attempt Failed: Email does not exist ");
                res.render('login', { layout: "loggedOut.hbs", error: "That email does not exist!" });
            }
        });
    });

});

/* Register Form */
app.get('/register', function (req, res) {
    res.render('register', { layout: "loggedOut.hbs" });
});

/* Register Form Submission */
app.post('/register', function (req, res) {

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;

    // Encrypt/Hash password 
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) res.redirect('/register');

        const U = new RegistrationInfo(username, email, hash, [], 0);
        const newUser = new Users(U);

        if (username.length == 0 || email.length == 0 || password.length == 0 || password2.length == 0) {
            res.render('register', { layout: "loggedOut.hbs", error: "Please fill out all fields!" });
        }
        else if (password !== password2) {
            res.render('register', { layout: "loggedOut.hbs", error: "Passwords do not match!" });
        }
        else if (password.length < 8) {
            res.render('register', { layout: "loggedOut.hbs", error: "Your password needs to be at least 8 characters long!" });
        }
        else {
            console.log("Validation passed for: ", U);
            console.log("Now checking for duplicates...");

            Users.find({ $or: [{ email: email }, { username: username }] }, (err, results) => {

                if (results.find(x => x.username === username)) {
                    res.render('register', { layout: "loggedOut.hbs", error: "Sorry, that username already exists" });
                }
                else if (results.find(x => x.email === email)) {
                    res.render('register', { layout: "loggedOut.hbs", error: "Sorry, that email is currently in use" });
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
    });

});

app.listen(port);