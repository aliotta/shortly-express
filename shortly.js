var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.get('/', 
function(req, res) {
  res.redirect('/login');
  res.render('index');
});

app.get('/login', 
function(req, res){
  res.render('login');
});

app.get('/create', 
function(req, res) {
  res.redirect('/login');
  res.render('index');
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
  //res.render('index');
});

app.get('/index', function(req, res){
  res.render('index');
});

app.get('/signup', function(req, res){
  res.render('signup');
});

app.get('/layout', function(req, res){
  res.render('layout');
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  //db.knex('users').select('loggedIn')
   db.knex('users').select('user_id', 'loggedIn').then(function(data){
    console.log("are you there, dear user? ", data);
      if(data[0].loggedIn === 0){
        console.log("you're logged in!");
      } else if (data[0].loggedIn === 1){
        //user does not exist
        if(!true){
          //create new user VIA SIGNUP
        } else { 
          //else, the user exists; redirect to login page. 
          console.log("You are not allowed");
          res.redirect('/login');
        }
      }
   });
     
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
app.post('/signup', 
  function(req, res){
    var username = req.body.username; 
    var password = req.body.password; 
    var isLoggedIn = 1; 

    new User({
      user_id: username, 
      password: password
    }).fetch().then(function(found){
      if(found) {
        //do something
        console.log("I ALREADY EXIST! :D");
      } else {
        console.log("I am in the else statement! CREATE MEEEEE");
        //If user is not found, then create the user and send it to the database. 
        Users.create({
          user_id: username, 
          password: password, 
          loggedIn: isLoggedIn
        })
        .then(function(){
          res.redirect('/index');
        });
      }
    });
});

//here we just need to log in the correct user and verify credentials.
app.post('/login', 
function(req, res){
  //look up the user_id
  var username = req.body.username; 
  //check the password 
  var password = req.body.password; 

  db.knex('users').select('user_id', 'password').where({
    user_id: username, 
    password: password
  }).then(function(data){
    if(data.length === 0){
      console.log("SIGN IN AGAIN"); 
      res.redirect('/login');
    } else {
      res.redirect('/index');
    }
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
