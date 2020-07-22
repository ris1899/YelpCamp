var express         = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose	   = require("mongoose"),
    flash          = require("connect-flash") 
   passport        = require("passport"),  // for authentication 
   LocalStrategy   = require("passport-local"), // local authentication can change to twitter,fb etc
   User            = require("./models/user"),
   Campground      = require("./models/campground"),
   //seedDB	       = require("./seeds"),
   Comment         = require("./models/comment");	

//==========================================================================
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/yelp_camp_v3",{useNewUrlParser:true});
var request =require("request");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname +"/public"));
 app.set("view engine","ejs" );
app.use(flash());
//seedDB();
//=============================================================================
//PASSPORT CONFIG
app.use(require("express-session")({ 
 secret: "this is best...",
 resave:	false,
saveUninitialized: false	
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// =============================================================================

// +++++++++++++++++++++
// whatever func provide to this will call on every route         
// whatever is puts in res.locals is available in every template  
app.use(function(req,res,next){                                   
	res.locals.currentUser=req.user;
	res.locals.message=req.flash("error");
	next();
})
//-------------------------------------------------------------------

app.get('/',function(req,res) {
	res.render("landing");
});
//========================================================
//INDEX ROUTE
app.get("/campgrounds",function(req,res){
	Campground.find({},function(err,allCampgrounds){
		if(err){console.log(err);}
		else{res.render("campgrounds/index",{campgrounds:allCampgrounds}); 
			}
	});	

} );
// create new CG post req
app.post("/campgrounds",isLoggedIn,function(req,res){
	var name=req.body.name;
	var price=req.body.price;
	var image=req.body.image;
	var desc=req.body.description;
	var author={
		id :req.user._id,
		username:req.user.username
	}
	var newcampground= {name:name,price:price, image:image, description:desc, author:author };
	Campground.create(newcampground,function(err,newcampground){
		if(err){console.log(err);}
		else{res.redirect("/campgrounds");}
	});	
});
//===============================================================


// NEW ROUTE
app.get("/campgrounds/new",isLoggedIn,function(req,res){
	res.render("campgrounds/new.ejs");
});
//===================================


// SHOW ROUTE
app.get("/campgrounds/:id",function(req,res){
      	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
			if(err){console.log(err);}
			else{ res.render("campgrounds/show",{campground:foundCampground}); }
		});
		 
		} );
//=====================================================





//  COMMENT
//=================
//new comment
app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){console.log(err);}
		else{
			res.render("comments/new",{campground:campground});
		}
	});
	
});

// create new comments
app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){console.log(err);}
		else{
			Comment.create(req.body.comment,function(err,comment){
				if(err){console.log(err);  res.redirect("/campgrounds") }
				else{
					//add user info  don't ask for username
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					comment.save();
					//=============
					
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/"+req.params.id);
				}
			});
		}
	});
});

//========================================================


//AUTH ROUTES
//=========================================
//get register
app.get("/register",function(req,res){
	res.render("register");
});
// post register
app.post("/register",function(req,res){
	var newUser= new User({username:req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err){console.log(err);
			   return res.render("register");}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/campgrounds");
		});
	});
});
//============================================


// LOGIN
//===========================================
// show login form
app.get("/login",function(req,res){
	res.render("login");
});
// LOGIN USER POST REQ
app.post("/login",passport.authenticate("local",
	   {
	     successRedirect: "/campgrounds",
	     failureRedirect: "/login"
        } ),function(req,res){

});
//======================================



//LOGOUT ROUTES
//======================================
app.get("/logout",function(req,res){
	req.logout();
	
	res.redirect("/campgrounds");
} );
//====================================



// ========================================
//+++++ EDIT AND UPDATE CAMP +++++++++++++++++++

app.get("/campgrounds/:id/edit",checkCampgroundOwnership,function(req,res){
	
		Campground.findById(req.params.id,function(err,foundCampground){
			if(err){res.redirect("");}
			else
		    {
			res.render("campgrounds/edit",{campground:foundCampground});
			}		
	  });			
});
app.post("/campgrounds/:id/update",checkCampgroundOwnership,function(req,res){
	
	//var newcampground= {name:name, image:image, description:desc, author:author };
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updateCampground){
		if(err){ res.redirect("/campgrounds/"+req.params.id+"/edit");}
		else{ res.redirect("/campgrounds/"+req.params.id);}
		
	});
	
});

//================================================

// DELETE CAMP
app.post("/campgrounds/:id/delete",checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndDelete(req.params.id,function(err,removeCamp){
		if(err){console.log(err); res.redirect("/campgrounds"); }
		else{res.redirect("/campgrounds");}
	});
});

//===============================================
// EDIT COMMENT AND UPDATE COMMENT

app.get("/campgrounds/:id/comments/:comment_id/edit",checkCommentOwnership,function(req,res){
	
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){res.redirect("back");}
		else{
	    res.render("comments/edit",{campground_id : req.params.id, comment:foundComment});		
		}
	});	
});

app.post("/campgrounds/:id/comments/:comment_id/update",checkCommentOwnership,function(req,res){
	 Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
	if(err){console.log(err);  res.redirect("back"); }
	else{
		res.redirect("/campgrounds/"+req.params.id);
	}	 
	 });
});
//================================================================================


// DELETE COMMENT

app.post("/campgrounds/:id/comments/:comment_id/delete",checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err,removeComment){
		if(err){ res.redirect("back");}
		else
			{
				res.redirect("back");
			}
	});
});


//=====================================
// middleware func  next is next thing to be called
function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		{
			return next();
		}
	req.flash("error","Please Login First!");
	 res.redirect("/login");}

//=====
function checkCampgroundOwnership(req,res,next)
{
  if(req.isAuthenticated())
      {
		Campground.findById(req.params.id,function(err,foundCampground){
		if(err){res.redirect("back");}
		else{
			   if(foundCampground.author.id.equals(req.user._id))
		        	{  next();}
				
			   else{ res.redirect("back");} 
		    }
	      });	
	   }
	else{
		res.redirect("back");
	}
}

//=======COMMENT AUTHORISATION
function checkCommentOwnership(req,res,next)
{
  if(req.isAuthenticated())
      {
		Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){res.redirect("back");}
		else{
			   if(foundComment.author.id.equals(req.user._id))
		        	{  next();}
				
			   else{ res.redirect("back");} 
		    }
	      });	
	   }
	else{
		res.redirect("back");
	}
}


app.listen(3000,function(){ console.log("the yelp camp server has started")}    );















