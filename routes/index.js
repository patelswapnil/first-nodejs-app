
//Dependencies
var express = require('express');
var cookieParser = require('cookie-parser');
var router = express.Router();
var mongoose = require('mongoose'); //mpngo connection
var bodyParser = require('body-parser'); //parses information form post
var methodOverride = require('method-override'); //used to manipulate post


//Models
var Product = require('../models/product');


router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}));





//store some data 
var todoItems = [
	{id: 1, desc: 'First'},
	{id: 1, desc: 'Second'},
	{id: 1, desc: 'Third'}
]




//Routes
function ToggleAllowed(req, res, next){
  var cookieVal = req.cookies.allowed;
  if(cookieVal == 'yes'){
    cookieVal = 'no';
  }
  else{
    cookieVal = 'yes';
  }

  res.cookie('allowed', cookieVal, { expires: new Date(Date.now() + 365*2*24*60*60*1000), httpOnly: true });

  next();  
}

router.get('/', function(req, res){
  //set the cookie allowed
  if (req.cookies.allowed === undefined){
    res.cookie('allowed', 'yes', { expires: new Date(Date.now() + 365*2*24*60*60*1000), httpOnly: true });
	}

  //render index page
  res.render('index', {
		title: 'My First Nodejs App',
    allowed: req.cookies.allowed,
		items: todoItems
	});
});


router.get('/:id/toogle', ToggleAllowed, function(req, res){
  console.log('value of cookie allowed is ' + req.cookies.allowed);
  res.redirect('/');
});

router.post('/add', function(req, res){
	var	 newItem = req.body.newItem;

	todoItems.push({
		id: todoItems.length + 1,
		desc: newItem
	});

	res.redirect('/');
});



//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/*Protect all Routes to /products/. by middleware*/
function IsAllowed(req, res, next) {
  var cookieAllowed = req.cookies.allowed;
  console.log('coockieAlowed value is ' + cookieAllowed);
  if (cookieAllowed == 'yes') {
    next();
  } else {
    //next(new Error('Not Logged In');
    console.log('coockieAlowed is not set to yes');
    res.status(404);
    res.render('404');  
  }
}

/*
router.get('/products/.', IsAllowed, function(req, res, next) {
    next();
});
*/

/*List All Products*/
router.route('/products')    
    //GET all product
    .get(IsAllowed, function(req, res, next) {
        //retrieve all Product from Monogo
        //mongoose.model('Product').find({}, function (err, products) {
        Product.find({}, function (err, products) {	
              if (err) {
                  //res.send('There are no Products to display!');
                  console.log('Error get: Error occured while retrieve Products list ' + err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.ejs file in the views/products folder. Also setting "products" to be an accessible variable in ejs view
                    html: function(){
                        res.render('products/index', {
                              title: 'All Products',
                              "products" : products
                          });
                    },
                    //JSON response will show all products in JSON format
                    json: function(){
                        res.json(products);
                    }
                });
              }     
        });
    })
    

    //POST a new product
    .post(IsAllowed, function(req, res) {
        // Get values from POST request.
        var name = req.body.productName;
        var available_quantity = req.body.quantity;
        var price = req.body.price;
        
        //call the create function for database
        //mongoose.model('Product').create({
        Product.create({	
            name : name,
            available_quantity : available_quantity,
            price : price           
        }, function (err, product) {
              if (err) {
                  //res.send("There was a problem adding the information to the database.");
                  console.log('Error Post: Error while adding the record ' + err);
              } else {
                  //Product has been created
                  //console.log('POST creating new Product: ' + product);
                  res.format({
                      //HTML response will set the location and redirect back to the home page.
                    html: function(){
                        // If it worked, set the header
                        res.location("products");
                        // And forward to success page
                        res.redirect("/products");
                    },
                    //JSON response will show the newly created blob
                    json: function(){
                        res.json(product);
                    }
                });
              }
        })
    });



/*Get Product Details with get Rouse and Edit Product Details with Post route*/
router.route('/products/:id')
  .get(IsAllowed, function(req, res) {
    //mongoose.model('Product').findById(req.id, function (err, product) {
    Product.findById(req.params.id, function (err, product) {  
      if (err) {
        //res.send('Error occured while retrieving requested record!');        
        console.log('Error get: Error while retrieving record ' + err);
      } else {
        console.log('Name of the Product is: ' + product.name);        
        res.format({
          html: function(){
              res.render('products/details', {                
                "product" : product
              });
          },
          json: function(){
              res.json(product);
          }
        });
      }
    });
  })

  //Edit Product details with POST Route
  .post(IsAllowed, function(req, res) {
        // Get values from POST request.
        var name = req.body.productName;
        var available_quantity = req.body.quantity;
        var price = req.body.price;
        
        Product.findById(req.params.id, function(err, product){
          if(err){
            //res.send('Error occured while retrieving requested record!');
            console.log('POST Error: Error occured while updating reocrd: ' + err);
          }
          else{
            //update the Product Details
            product.name = name;
            product.available_quantity = available_quantity;
            product.price = price;

            //save the changes made to the product
            product.save(function(err){
                if(err){
                  //res.send('Error Occured while editing record!');
                  console.log('Error Post : Error while saving the record ' + err);
                }
                else{
                  //Product has been updated
                  //console.log('Updated Product with POST: ' + product);
                  res.format({
                      //HTML response will set the location and redirect back to the home page.
                    html: function(){
                        // If it worked, set the header
                        //res.location("products");
                        // And forward to success page
                        res.redirect("/products");
                    },
                    //JSON response will show the newly created blob
                    json: function(){
                        res.json(product);
                    }
                  });   
                }
            });
          }
        });      
    });




//GET the individual Product Details by Mongo ID by get and allow user to modify detials
router.route('/products/:id/edit')
  .get(IsAllowed, function(req, res) {
    //search for the product within Mongo
    Product.findById(req.params.id, function (err, product) {
      if (err) {
        //res.send('Error occured while retrieving requested record!');
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
          //Return the Product Details
          //console.log('GET Retrieving ID: ' + product._id);
                    
          res.format({
            //HTML response will render the 'edit.ejs'
            html: function(){
              res.render('products/edit', {                                            
                "product" : product
              });
            },
            //JSON response will return the JSON output
            json: function(){
              res.json(product);
            }
          });
        }
    });
  });



/* GET New Product page. */
router.get('/new', IsAllowed, function(req, res) {
    res.render('products/new', { title: 'Add New Product' });
});



//DELETE a Product by ID
router.delete('/products/:id/edit', IsAllowed, function (req, res){
    //find product by ID
    Product.findById(req.params.id, function (err, product) {
        if (err) {
            //res.send('Error occured while retrieving requested record!');
            return console.error(err);
        } else {
            //remove it from Mongo
            Product.remove({
              _id: product._id
            },
              function (err, product) {
                if (err) {
                    //res.send('Error occured while deleting requested record!');
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    //console.log('DELETE removing ID: ' + product._id);
                    res.format({
                        //HTML returns to the main list Product page
                          html: function(){
                               res.redirect("/products");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : product
                               });
                         }
                      });
                }
            });
        }
    });
});
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%






//Return Router
module.exports = router;