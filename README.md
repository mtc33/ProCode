![](Logo.png)

------

## ProCode

A proof-of-concept competitive programming website where users can attempt custom problems in Java, C++, and Python, and see how they rank against other users. 

Features in progress: 
- C++ and Python support 
- Improved ranking system 
- More problems to be added soon 

Author: [@chenmark33](https://github.com/chenmark33)

------

### Screenshots 

![](SplashPage.png)
&nbsp;
![](ProblemPage.png)

### Built using: 

* **Node.js** 12.7.0 
* **Express.js** 4.17.1
* **MongoDB** 3.5.5
* **Passport.js** 0.4.1
* **bcrypt** 4.0.1

### How to Build: 

* Clone Repository
  * Ensure that Node and MongoDB are installed 
* Go into `db.js` and change `procodeuser` on line 39 into your MongoDB database name 
  * Optional: If authorization is enabled, create a `config.json` with the following code and substitue in your credentials
    `{"dbconf" : "mongodb://yourDBUserName:yourDBPassword@localhost/procode"}`
* Execute `node populate.js` to populate the database with two sample questions 
* Start the app with `node app.js`
  * `NODE_ENV=PRODUCTION node app.js` if 'config.json' was used 
* Install necessary dependencies if warnings appear 
* http://localhost:3000/