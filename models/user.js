var mongoose= require("mongoose");
var passportLocalMongoose =require("passport-local-mongoose");
var userSchema= new mongoose.Schema({
	username :String,
	password: String
});
// VeryImp add methods to user
userSchema.plugin(passportLocalMongoose); 
module.exports= mongoose.model("User",userSchema);