var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require("express-session");
var uuid = require('uuid');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var bcrypt = require('bcrypt-nodejs');

var app = express();

app.set('trust proxy', 1); 

app.use(session({
  genid: function(req){
    console.log("Generated seesion ID"); //make the session id the token
    return uuid.v4();
  }, 
  secret: "potatoes need salt"
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}


app.get('/', 
function(req, res) {
  res.redirect('/login');
  res.render('index');
});

app.get('/login',  
function(req, res){
  res.render('login')
});

app.get('/create', 
function(req, res) {
  res.redirect('/login');
  res.render('index');
});

app.get('/links', restrict,
function(req, res) {
    Links.reset().fetch().then(function(links) {
      res.send(200, links.models);
    });
});

app.get('/index', restrict, function(req, res){
  res.render('index');
});

app.get('/signup', function(req, res){
  res.render('signup');
});

app.get('/layout', restrict, function(req, res){
  res.render('layout');
});

app.post('/log-out', function(req, res){
  console.log("Log me out bro ");
  req.session.destroy(function(err){
    if(err) {
      console.log(err);
    }
  }); 
  res.redirect('/login');
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }
     
  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Links.create({
          url: uri,
          title: title,
          base_url: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
//Here we need to sign up and create a new User. 
//sorry, user. You still have to login again. 
app.post('/signup', 
  function(req, res){
    var username = req.body.username; 
    var password = req.body.password; 
    var isLoggedIn = 1; 

    new User({
      username: username, 
      password: password
    }).fetch().then(function(found){
      if(found) {
        //do something
        console.log("I ALREADY EXIST! :D");
      } else {
        console.log("I am in the else statement! CREATE MEEEEE");
        //If user is not found, then create the user and send it to the database. 
        Users.create({
          username: username, 
          password: password, 
          loggedIn: isLoggedIn
        })
        .then(function(){
          res.redirect('/');
        });
      }
    });
});

//var userSession;
//here we just need to log in the correct user and verify credentials.
app.post('/login', 
function(req, res){
  //look up the username
  var username = req.body.username; 
  //check the password 
  var password = req.body.password; 
  //check if the username and password match
  

  db.knex('users').select('username', 'salt').where({
    username: username
  }).then(function(data){
    if(data.length<1){
      res.redirect('/login');
      return; 
    } 
    console.log(data, "Dinosaurs ");
    var salt = data[0].salt;
    console.log("Low sodium ", salt) 

    var hash = bcrypt.hashSync(password, salt);

    db.knex('users').select('username').where({
      username: username, 
      password: hash 
    }).then(function(data){
      if(data.length === 0){
        console.log("SIGN IN AGAIN: ", hash); 
        res.redirect('/login');
      } else {
        req.session.regenerate(function(){
          req.session.user = username;
          res.redirect('/index'); 
        });
      }
    });
  });
});


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits')+1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
