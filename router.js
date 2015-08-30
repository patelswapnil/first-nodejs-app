var express = require('express');

var router = express.Router();



//store some data 
var todoItems = [
	{id: 1, desc: 'First'},
	{id: 1, desc: 'Second'},
	{id: 1, desc: 'Third'}
]



//define routes
router.get('/', function(req, res){
	res.render('index', {
		title: 'My First Nodejs App',
		items: todoItems
	});
});


router.post('/add', function(req, res){
	var	 newItem = req.body.newItem;

	todoItems.push({
		id: todoItems.length + 1,
		desc: newItem
	});

	res.redirect('/');
});


module.exports = router;