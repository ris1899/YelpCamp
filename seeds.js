var mongoose= require("mongoose"),
	Campground=require("./models/campground"),
	Comment = require("./models/comment");

var data=[
	{ name:"camp1", 
      image: "https://pixabay.com/get/52e8d4444255ae14f1dc84609620367d1c3ed9e04e507440752b7cd5934ec0_340.jpg",
	  description: "blah, blah awesome"
	},
	{ name:"camp2", 
      image: "https://pixabay.com/get/57e1dd4a4350a514f1dc84609620367d1c3ed9e04e507440752b7cd5934ec0_340.jpg",
	  description: "Camping is an outdoor activity involving overnight stays away from home in a shelter, such as a tent or a recreational vehicle. Typically participants leave developed areas to spend time outdoors in more natural ones in pursuit of activities providing them enjoyment. To be regarded as  a minimum of one night is spent outdoors, distinguishing it from day-tripping, picnicking, and other similarly short-term recreational activities. Camping can be enjoyed through all four seasons."
	},
		{ name:"camp3", 
      image: "https://pixabay.com/get/57e1d14a4e52ae14f1dc84609620367d1c3ed9e04e507440752b7cd5934ec0_340.jpg",
	  description: "blah, blah awesome"
	}	
]
function seedDB(){
 Campground.remove({},function(err){
	if(err){console.log(err);}
	console.log("removed campgrounds");
	// data.forEach(function(seed){
		 
	//	Campground.create(seed,function(err,campground){
	//		if(err){console.log(err);}
	//		else{
	//			Comment.create({
	//				text:" awesome camp site",
	//				author: "homie"
	//			},function(err,comment){
	//				if(err){console.log(err);}
	//				else{
	/*				 campground.comments.push(comment);
					campground.save();
					console.log("new comment");
	
					}						
				} );
				
			}
		}) ;
	 });
	 */
	 
});	
}
	module.exports=seedDB;
