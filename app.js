/**
* Module dependencies.
*/
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , admin = require('./routes/admin')
  , http = require('http')
  , path = require('path');
var fileUpload = require('express-fileupload');
var session = require('express-session');
var app = express();
var mysql      = require('mysql');
var bodyParser=require("body-parser");
var connection = mysql.createConnection({
              host     : 'localhost',
              user     : 'root',
              password : '',
              database : 'ordercaffe'
            });
 
connection.connect();
 
global.db = connection;
 
// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
//-----use--------
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
              secret: 'keyboard cat',
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 3600000*24*90 }
            }));
app.use(function(req, res, next){
  res.locals.user = req.session.user;
  next();
});
app.use(function(req, res, next){
  res.locals.ssadmin = req.session.ssadmin;
  next();
});
 
// development only
//call for main index page
app.get('/', user.login);
app.get('/index', routes.call_index);
//---------------user----------------------
app.get('/cart', user.call_cart);

app.get('/login', user.login);//call for login page
app.get('/passwordRecovery', user.passwordRecovery);
app.get('/reset',user.reset);

app.get('/signup',user.call_signup);
app.post('/signup',user.call_signup);

app.post('/login', user.login);//call for login post
app.post('/reset',user.reset);
app.post('/passwordRecovery', user.passwordRecovery);

app.get('/home/dashboard', user.dashboard);//call for dashboard page after login
app.get('/logout', user.logout);//call for logout
app.get('/home/profile',user.profile);//to render users profile

app.get('/getOrderedList', user.get_order_list);
app.post('/orderedList', user.ordered_list);

app.post('/confirmOrder', user.confirm_order);

app.get('/showCart', user.show_cart_list);
//---------------user end----------------------------

//-----------------admin--------------------
app.get('/admin',admin.admin_login);
app.post('/admin',admin.admin_login);
app.get('/admin/logout', admin.logout);

app.get('/admin/add_items',admin.add_items);
app.post('/admin/add_items',admin.add_items);

app.get('/admin/show_all',admin.show_all_items);
app.get('/admin/edit_items/:id',admin.edit_items);
app.post('/admin/update_items/:id',admin.update_items);
app.post('/admin/change_photo/:id', admin.update_photo);

app.get('/orders', admin.order_list);
//------------------admin end---------------------
app.listen(8080)
