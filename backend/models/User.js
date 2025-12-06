const mongoose = require("mongoose") //importing mmodule
 
//create a table or schema

const UserSchema = new mongoose.Schema({
 name:{
	type:String,
	required:false},
email:{
	type:String,
	required:true,
	unique:true},
passwordHash:{
	type:String,
	required:true
},
createdAt:{
	type:Date,
	default:Date.now
}
});

module.exports = mongoose.model("User",UserSchema);
