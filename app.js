var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var methodOverride = require("method-override");
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var multer = require('multer');
var path = require('path');
// var upload = multer({dest: './uploads'});
var flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;
var app = express();

var User = require('./models/user');


// change image from hex number to actule file.exe
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
});
var upload = multer({storage: storage});
//
var upload = multer({ storage: storage });
//var routes = require('./routes/index');
//var users = require('./routes/users');



// Handle Sessions
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave: true
}));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + '/uploads'));
//app.use("/uploads", express.static(__dirname + '/uploads'));
app.use(bodyParser.urlencoded({extended: true}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

////////////////////////////////
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});
////////////////////////////

//Routes
app.get("/",function(req, res){
   res.render("landing");
});
app.get("/Register", function(req, res){
   res.render("Register"); 
});
app.post("/Register", upload.single('pic'), function(req, res){
   var username = req.body.username;
   var name = req.body.name;
  var email = req.body.email;
//  var username = req.body.name;
  var password = req.body.password;
  var rpassword = req.body.rpassword;
  var phone = req.body.phone;
  var street = req.body.street;
  var city = req.body.city;
  var state = req.body.state;
  var country = req.body.country;
  var zipcode = req.body.zipcode;
  var website = req.body.website;
  var gender = req.body.gender;
  var birthdayd = req.body.birthdayd;
  var birthdaym = req.body.birthdaym;
  var birthdayy = req.body.birthdayy;
  var nat = req.body.nat;
  var register = req.body.register;
 // res.render("/Register",{ name: name, email:email,password:password, rpassword:rpassword });
  console.log(username);
  console.log(name);
  console.log(email);
  console.log(passport);
  console.log(rpassword);
  console.log(phone);
  console.log(street);
  console.log(city);
  console.log(state);
  console.log(country);
  console.log(zipcode);
  console.log(gender);
  console.log("your birthday is " + birthdayd + "/" + birthdaym + "/" + birthdayy);
  console.log(nat);
  console.log(website);
  console.log(req.file);
  
  
  if(req.file){
  	console.log('Uploading File...');
  	var profileimage = req.file.filename;
  } else {
  	console.log('No File Uploaded...');
  	var profileimage = 'noimage.jpg';
  }
   // Form Validator
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  //req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('rpassword','Retype Passwords do not match').equals(req.body.password);
   req.checkBody('phone','Phone field is required').notEmpty();
  req.checkBody('street','Street field is required').notEmpty();
  req.checkBody('city','City field is required').notEmpty();
  req.checkBody('country','Country field is required').notEmpty();
  req.checkBody('gender','Geander field is required').notEmpty();
  req.checkBody('nat','Nationality field is required').notEmpty();
   req.checkBody('birthdayy','Birthday year field is required').notEmpty();
  req.checkBody('birthdaym','Birthday month field is required').notEmpty();
  req.checkBody('birthdayd','Birthday day field is required').notEmpty();
  

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
  	res.render('Register', {
  		errors: errors
  	});
  } else{
         var newUser = new User({
      username: username,
      name: name,
      phone: phone,
      website: website,
      birthday: birthdayy,
      street: street,
      city: city,
      state: state,
      country: country,
      zipcode: zipcode,
      email: email,
      gender: gender,
      password: password,
      profileimage: profileimage
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    req.flash('success',"Welcome " + req.body.name +", " + 'You are now registered and can login');

    res.location('/index');
    res.redirect('/index');
  }
});

//index page where resume are
app.get('/index', isLoggedIn, function(req, res, next) {
  res.render('index');
});
app.get("/index/:id", function(req, res){
   // res.render("profile");
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            console.log(foundUser)
            //render show template with that campground
            res.render("show1", {currentuser: foundUser});
        }
    });
  
});
app.post("/index/:id", function(req, res){
   // res.render("profile");
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            console.log(foundUser)
            //render show template with that campground
            res.render("show", {currentuser: foundUser});
        }
    });
  
});
app.get("/index/:id/edit", function(req, res){
    console.log("IN EDIT!");
   // find the campground with provided ID
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        } else {
       //     render show template with that campground
            res.render("edit");
        }
    });
});
app.get("/index/:id/resume", function(req, res){
    
            res.render("resume");
});

app.put("/index/:id", function(req, res){
    var newData = {name: req.body.name};
    User.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/index/" + user._id);
        }
    });
});



//index page where resume are
//app.get('/uploads/:id', upload.single('upl'), function(req, res){
//  res.render('index');
//});

//Login
app.get('/Login', function(req, res, next) {
  res.render('Login', {title:'Login'});
});

app.post('/Login', passport.authenticate('local',{failureRedirect:'/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
   req.flash('success', 'You are now logged in');
   res.redirect('/index');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }
    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message:'Invalid Password'});
      }
    });
  });
}));

//middleware
 function isLoggedIn(req, res, next){
     if(req.isAuthenticated()){
         return next();
     }
     req.flash("error", "You must be signed in to do that!");
     res.redirect("/login");
 }
//Welcome page
app.get("/landing", function(req, res){
   res.render("landing");
});

// logout route
app.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "LOGGED YOU OUT!");
   res.redirect("/landing");
});


app.listen(process.env.PORT,process.env.IP, function(){
   console.log("NodeAuth server has started"); 
});