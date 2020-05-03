const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username : {type: String, required: true}, 
    email : {type: String, required: true},
    password : {type: String, required: true}, 
    questions : {type: Array, required: true}, 
    rating : {type: Number, required: true}
});

const questionSchema = new mongoose.Schema({
    name : {type: String, required: true}, 
    supportedLanguages : {type: Array, required: true}, 
    category : {type: Array, required: true}, 
    difficulty : {type: Number, required: true}, 
    starterCode : {type: String, required: true}, 
    description : {type: String, required: true}
});

mongoose.model('Users', userSchema);
mongoose.model('Questions', questionSchema);

// Checks if environment variable NODE_ENV is set to production or not 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {

    // If we're in PRODUCTION mode, then read the configration from a file
    // Use blocking file io to do this...
    const fs = require('fs');
    const path = require('path');
    const fn = path.join(__dirname, '/config.json');
    // const fn = path.join(__dirname, '/awsconfig.json');
    const data = fs.readFileSync(fn);
    // Set the connection string to the configuration in our JSON file 
    const conf = JSON.parse(data);
    dbconf = conf.dbconf;
} 
else {
    // if we're not in PRODUCTION mode, then use: 
    dbconf = "mongodb://localhost/procodeuser";
}

mongoose.connect(dbconf, {useUnifiedTopology:true, useNewUrlParser: true}); 