'use strict';                                                                                                                                                                                   

//Import the required module
var app = require('express')();
var path = require('path');
var bodyParser = require('body-parser');


//configure app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//use middleware
app.use(bodyParser());


//define routes
app.use(require('./router'));




//start the server
var port = Number(process.env.PORT || 3000);
app.listen(port);

/*
app.listen(1337, function(){
	console.log('ready on port 1337');
});	
*/