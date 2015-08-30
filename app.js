'use strict';                                                                                                                                                                                   

//Dependencies
var app = require('express')();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');


var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';


//Either Connecto Development OR Production Database
if(env === 'development'){
	//Connect to Local MongoDB
	mongoose.connect('mongodb://localhost/mongodb_test');
}
else{
	//Connect to cloud MongoDB on mongolab
	mongoose.connect('mongodb://swapnil:mongosandbox@ds039441.mongolab.com:39441/mongosandbox');
}



//configure app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//use middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//define routes
//app.use(require('./router')); //old line
app.use('/',require('./routes/index')); //new line



//start the server
var port = Number(process.env.PORT || 3000);
app.listen(port);

/*
app.listen(1337, function(){
	console.log('ready on port 1337');
});	
*/