![](Logo.png)

------

## ProCode

A proof-of-concept competitive programming website where users can attempt custom problems in Java, C++, and Python, and see how they rank against other users. 

FEATURES IN PROGRESS: 
- User Authentication 
- Actual compilation support 
- Rankings 

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
* **bcrypt** 4.0.1

### How to Build: 

* Clone Repository
  * Ensure that Node and MongoDB are installed 
* Go into `db.js` and change `procodeuser` on line 39 into your MongoDB database name 
  * Optional: If you want a password protected database, create a `config.json` with the following code: 
    `{"dbconf" : "mongodb://yourDBUserName:yourDBPassword@localhost/procode"}`
* Execute `node populate.js` to populate the database with two sample questions 
* Install necessary dependencies if warnings appear 
* Start the app 
  * If `config.json` was configured, run `NODE_ENV=PRODUCTION node app.js`
  * Otherwise, run `node app.js`
* Note: Home page is on `http://localhost:3000/main`