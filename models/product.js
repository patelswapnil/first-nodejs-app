//Dependencies
var mongoose = require('mongoose');



//schema
var productSchema = new mongoose.Schema({
	name: String,
	available_quantity: Number,
	price: Number
});




//Return Model
module.exports = mongoose.model('Product', productSchema);