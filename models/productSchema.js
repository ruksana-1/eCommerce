const mongoose = require('mongoose');


//-------------------------------------------------------------------------------------
// Review Schema
//-------------------------------------------------------------------------------------
const reviewSchema = new mongoose.Schema({
    reviewerName : { type : String, required : true },
    rating : { type : Number, min : 1, max : 5},
    comment : { type : String, required : true },
},{ timestamps : true },{ _id : false }
)

//-------------------------------------------------------------------------------------
// Product Schema
//-------------------------------------------------------------------------------------
const productSchema = new mongoose.Schema({
    brandName : { type : String, required : true },
    description : { type : String, required : true},
    imagesPath : [{ type : String, required : true }],
    thumbnailsPath : [{ type : String, required : true }],
    sizes : { type : [String], required : true },
    price : { type : Number, default : 0,  required : true },
    category : { type : mongoose.Schema.Types.ObjectId, ref : 'Category', required : true },
    stockCount : { type : Number, required : true, min : 0, max : 250 },
    isFeatured : { type : Boolean, default : false},
    discount : { type : Number },
    discountAmount : { type : Number },
    priceAfterDiscount : { type : Number },
    type : { type : String },
    occation : { type : String },
    reviews : { type : [reviewSchema], default : [] },
    },{ timestamps : true }
);

const Product = mongoose.model('Product', oroductSchema);

module.exports = Product ;