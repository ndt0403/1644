var express = require('express');
var router = express.Router();
const authenticate = require('../models/authenticator');
const table_crud = require('../models/table_crud');
const table_director= require('../models/table_director.js');
const admin_crud = require('../models/admin_crud');
const product_crud = require('../models/product_crud');
const select_form = require('../models/dropdown_list');
const registerUser = require('../models/registerUser');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', {title: "User Page"});
});
// GET the login page
router.get('/login', function(req, res, next) {
  res.render('login', { title : "Login page", message : ""});
});
// GET the register page
router.get('/register', function(req, res, next) {
  res.render('register', { title : "Register page", message : ""});
});
// GET the register page
router.post('/register', async function (req, res, next) {
  const user_name = req.body.username;
  const pass_word = req.body.password;

  // Add registration logic here to save the user to the database
  const registrationResult = await registerUser(user_name, pass_word);

  if (registrationResult) {
    // Registration successful, redirect to login page
    res.redirect('/users/login');
  } else {
    // Registration failed, redirect back to the registration page with a message
    res.render('register', { title: "Register Page", message: "Registration failed. Please try again." });
  }
});

//POST by the login form logic cho dung trang
router.post('/login', async function(req, res, next) {
  let user_name = req.body.username;
  let pass_word = req.body.password;
  let user = await authenticate(user_name, pass_word)
  if(user)
  {
    //store user's shop in session after login
    req.session.username = user_name;
    req.session.role = user.role;
    req.session.department_id = user.department_id;
    // console.log("Session data:", req.session);
    if(req.session.role == 'admin')
    {
      res.redirect('/users/admin');
    }
    else if(req.session.role == 'director')
    {
      res.redirect('/users/director');
    }
    else if(req.session.role == 'staff')
    { 
      res.redirect('/users/profile');
    }
  }
  else
  res.render('login', { 
    title : "Login page", 
    message : "Wrong username and password, please login again."});
});

/* GET logout. */
router.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});

/* GET admin page */
router.get('/admin', async function(req, res, next) {
  // check username in session to make sure that user logged in.
  if (req.session.username)
  {
    let user_name = req.session.username;
    let role = req.session.role;
    let table_string = await table_crud('users', role);
    res.render('admin', { title : "Admin page", user_cells: table_string, uname: user_name});
  } else {
    res.redirect('/users/login')
  }
}); 
router.get('/director', async function(req, res, next) {
  // check username in session to make sure that user logged in.
  let user_name = req.session.username;
  let table_string = await table_director('products');
  let form_string = await select_form();
  // console.log(table_string)
  if (user_name)
  {
    res.render('director', {title: "Director",
      uname: user_name, 
      product_cells: table_string, 
      select_form: form_string,
    });
  } else {
    res.redirect('/users/login')
  }
});



router.post('/director', async function(req, res, next) {
  // Save selected shop_id into session
  req.session.shop_id = req.body.shop_selected;
  res.redirect('/users/director');
});


/* GET shop page */
router.get('/profile', async function(req, res, next) {
  // check username in session
  if (req.session.username)
  {
    let user_name = req.session.username;
    let role = req.session.role;
    let department_id = req.session.department_id;
    // console.log("User's Shop from session:", department_id);
    console.log("Session data:", req.session);
    let table_string = null;
    table_string = await table_crud('products', role, department_id);
    res.render('profile', { title : "Shop page", product_cell: table_string, uname: user_name});
  }else {
    res.redirect('/users/login')
  }
});
/* POST crud for shop page */
// Handle CRUD operations for both admin and product tables
router.post('/crud', async function(req, res, next) {
  const req_body = req.body;
  const btn = req_body.btn;
  let role = req.session.role;
  let department_id = req.session.department_id;

  if (btn === 'Update' || btn === 'Delete' || btn === 'Create') {
    let table_name;
    if (role == 'admin') {
      table_name = 'users'; 
      await admin_crud(req_body, table_name);
    } else if (department_id == 2) {
      table_name = 'products';
      await product_crud(req_body, table_name);
    } 
  }
  // Redirect back to the appropriate page after the operation
  if (role === 'admin') {
    res.redirect('/users/admin');
  } else {
    res.redirect('/users/profile');
  }
});


/* Router for /refreshtime, POST */
router.post('/refreshtime', async function(req, res, next) {
  // Save selected interval into session
  req.session.interval = req.body.interval;
  res.redirect('/users/director');
});
module.exports = router;