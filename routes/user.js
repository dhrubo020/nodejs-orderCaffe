var array = [];


var crypto = require('crypto'),
algorithm = 'aes-256-ctr',
password = 'd6F3Efeq';

function encrypt(text){
var cipher = crypto.createCipher(algorithm,password)
var crypted = cipher.update(text,'utf8','hex')
crypted += cipher.final('hex');
return crypted;
}

function decrypt(text){
var decipher = crypto.createDecipher(algorithm,password)
var dec = decipher.update(text,'hex','utf8')
dec += decipher.final('utf8');
return dec;
}

//---------------------------call sign up function---------------------------------
exports.call_signup = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post  = req.body;
      var success = 'no';
      var date = new Date();

      var name = post.name;
      var profession = post.profession;
      var department = post.department;
      var address = post.address;
      var floor = post.floor;
      var password = post.password1;
      var email= post.email;
      var phone= post.phone;
      let ok = "0";

      var sql="SELECT * FROM `login` WHERE Phone ='"+phone+"' ";                           
      var query = db.query(sql, function(err, results_login){     
         if(results_login.length>0){
            message = 'This Phone number already exist!!';
            res.render('signup.ejs',{message: message});
         }else{
            var sql="SELECT * FROM `login` WHERE Email ='"+email+"'  ";                           
            var query = db.query(sql, function(err, results_login){     
               if(results_login.length>0){
                  ok=0;
                  message = 'This Email already exist!!';
                  res.render('signup.ejs',{message: message});
               }else{
                  //---insert start----
                  var pass = encrypt(post.password1);
                  var sql = "INSERT INTO `login`(`Email`,`Phone`,`Password`) VALUES ('" + email + "','" + phone + "','" + pass + "')";

                  var query = db.query(sql, function(err, result) {
                     if(err){
                        message = "Something went wrong!!";
                        res.render('signup.ejs',{message: message});
                     }else{
                        success='1';
                        //message = "Succesfully! Your account has been created. Now you can login.";
                        //res.render('home.ejs',{message: message});
                     }
                  });

                  var sql="SELECT * FROM `login` WHERE Phone ='"+email+"' OR Email ='"+email+"'  ";                           
                  var query = db.query(sql, function(err, results_login){     
                     if(results_login.length>0){
                        var dbpass = decrypt(results_login[0].Password);
                        console.log(password+ "  " +dbpass);
                        if(password == dbpass) {
                              let userId = results_login[0].Login_ID;
                              var sql = "INSERT INTO `customer`(`Customer_ID`,`Name`,`Profession`,`Department`,`Address`,`Floor`, `Date_time`)  VALUES ('" + userId + "','" + name + "','" + profession + "','" + department + "','" + address + "','" + floor + "','" + date + "')";

                              var query = db.query(sql, function(err, result) {
                                 if(err){
                                    message = "Something went wrong!!";
                                    res.locals.user='';
                                    res.render('signup.ejs',{message: message});
                                 }else{
                                    success='yes';
                                    message = "Succesfully! Your account has been created. Now you can log in.";
                                    //res.redirect("/");
                                    res.render('login.ejs',{message: message});
                                 }
                              });
                        }else{
                           res.locals.user='';
                           message = 'Error in saving.';
                           res.render('signup.ejs',{message: message});
                        }
                     }else {
                        res.locals.user='';
                        message = 'Error in finding the user.';
                        res.render('signup.ejs',{message: message});
                     }
                  });
                  //---insert end----
               

               }
            });
         }
      });
      

      
   }else{
      res.locals.user='';
      res.render('signup.ejs');
   }
};

//-----------------------------------------------login page call------------------------------------------------------
exports.login = function(req, res){
   var message = '';
  
   if(req.method == "POST"){
      var post  = req.body;
      var email= post.email;
      var pass= post.password;
      
      var sql="SELECT * FROM `login` WHERE Phone ='"+email+"' OR Email ='"+email+"'  ";                           
      db.query(sql, function(err, results_login){     
         if(results_login.length>0){
            var dbpass = decrypt(results_login[0].Password);

          if(pass == dbpass) {
            //req.session.userId = results_login[0].Login_ID;
            //req.session.user = results_login[0];

            var sql="SELECT * FROM `customer` WHERE Customer_ID ='"+results_login[0].Login_ID+"' ";                           
            db.query(sql, function(err, results_customer){     
                     if(results_customer.length>0){
                        req.session.user = results_customer[0];
                        req.session.userId = results_customer[0].Customer_ID;
                        req.session.userName = results_customer[0].Name;
                        res.locals.user = results_customer[0].Name; ;
                        console.log(res.locals.user);
                        res.redirect('/index');
                     }else{
                        message = 'Error in finding the user.';
                        res.render('login.ejs',{message: message});
                     }
            });
               
           }else{res.render('login.ejs',{message: "Email and password does not match"});
               // res.json({
               //    status:false,
               //    message:"Email and password does not match"
               //   });
                 
            }
         }
         else{
            message = 'Wrong Email/Phone';
            //res.redirect("/");
            res.render('login.ejs',{message: message});
         }
                 
      });
   }
   else {
        res.redirect("/index");
         //res.locals.user='';
         //res.render('login.ejs',{message: message});
      }
};
//-----------------------------------------------dashboard page functionality----------------------------------------------
           
exports.dashboard = function(req, res, next){
           
   var user =  req.session.user,
   userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `login` WHERE `Login_ID`='"+userId+"'";

   db.query(sql, function(err, results){
      res.render('dashboard.ejs', {user:user});    
   });       
};
//------------------------------------logout functionality----------------------------------------------
exports.logout=function(req,res){
   req.session.destroy(function(err) {
      res.redirect("/login");
   })
};
//--------------------------------Profile page render user details after login--------------------------------
exports.profile = function(req, res){

   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql = " SELECT * FROM customer LEFT JOIN login ON (customer.Customer_ID=login.Login_ID) WHERE login.`Login_ID` = '"+userId+"' and customer.`Customer_ID`='"+userId+"' ";

   //var sql="SELECT login.Email as email, login.Phone as phone JOIN  `customer` WHERE `Customer_ID`='"+userId+"'";
   db.query(sql, function(err, result){ 
      if(result.length>0){
         message='';
         res.render('profile.ejs',{data:result,message:message});
      }
      else{
         message='';
         res.render('add_details.ejs',{id:userId,message:message});
      }
      
   });
};
//---------------------------------edit users details after login----------------------------------
exports.editprofile=function(req,res){
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";
   db.query(sql, function(err, results){
      res.render('edit_profile.ejs',{data:results});
   });
};
//---------------------------------Password Recovery (Email search) ----------------------------------------------------//
exports.passwordRecovery = function(req, res){
   var message = '';
   if(req.method == "POST"){
      var post  = req.body;
      var email= post.email;
     
      var sql="SELECT * FROM `users` WHERE `email`='"+email+"'";   
                             
      db.query(sql, function(err, results){      
         if(results.length){
            console.log(results[0].id);
            res.render('reset.ejs',{data:results,message: message});
         }
         else{
            console.log('email search err1');
            message = 'Email not found.';
            res.render('passwordRecovery.ejs',{message: message});
         }
      });
   } else {
      console.log('email search err2');
      res.render('passwordRecovery.ejs',{message: message});
   }    
};
//--------------------------------------Reset password -----------------------------------------------------//
exports.reset=function(req,res){
   
   message = '';
   if(req.method == "POST"){
      var post  = req.body;
      var email = post.email;
      var password = post.password1;
      var sql = "UPDATE `users` SET `password` = '" + password + "' WHERE `users`.`email` = '" + email + "'";
      var query = db.query(sql, function(err, result) {
         if(err){
            message = "Something went wrong!!";
            res.render('passwordRecovery.ejs',{message: message});
         }else{
         message = "Succesfully! Your password has been updated. Now you can log in with new password.";
         res.render('index.ejs',{message: message});
         }
      });

   } else {
      res.render('passwordRecovery.ejs');
   }
};
//------------------------Cart-----------------
exports.call_cart = function(req,res){
   res.render('cart_list.html');
}
//----------------ordered list--------------
exports.ordered_list = function(req, res){
   if(req.method == "POST"){
      array = req.body;
      //console.log(array);
      res.redirect('/getOrderedList');
   }
}
exports.get_order_list = function(req, res){
   if(req.session.user!=null){
      //console.log(array);
      res.render('ordered_list.ejs', {items: array});
   }
}
//-------------------Confirm Order----------------------
exports.confirm_order = function(req, res){
   if(req.session.user!=null && req.method == "POST"){
      var CurrenUser = req.session.user;
      var address = req.body.address;
      var phone = req.body.phone;
      var order_details = "";

      for(let i=0; i< array.length-1; i++){
         var id = array[i].id;
         var name = array[i].name;
         var unit_price = array[i].unit_price;
         var quantity = array[i].quantity;
         var total_price = array[i].total_price;
         //console.log(id+" "+name+" "+unit_price+" "+total_price);
         order_details = order_details.concat( name+"("+unit_price+")--"+quantity+"--"+total_price+" | ");
      }
      order_details = order_details.concat("TOTAL PRICE " +array[array.length-1].grand_total_price+" Tk");
      console.log(CurrenUser.Customer_ID, CurrenUser.Name, address, phone, order_details);
      var bdTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Dhaka"});
      var date = new Date(bdTime);

      var sql = "INSERT INTO `order_list`(`Customer_ID`,`Customer_Name`,`Phone`,`Delivery_Address`,`Order_Details`,`Total_Amount` ,`Date_Time`)  VALUES ('" + CurrenUser.Customer_ID + "','" + CurrenUser.Name + "','" + phone + "','" + address + "','" + order_details + "','" + array[array.length-1].grand_total_price + "','" + date + "')";

         var query = db.query(sql, function(err, result) {
            if(err){
               message = "Something went wrong!!";
               res.render('order_error.ejs',{});
            }else{
               message = "Order Succesfully Done!";
               res.redirect("/index");
            }
         });
   }
}
//--------------Show cart list-------------------
exports.show_cart_list = function(req, res){
   if(req.session.user!=null){
      var CurrenUser = req.session.user;
      var ID = CurrenUser.Customer_ID;

      var sql = "SELECT * FROM `order_list` WHERE `Customer_ID`= '"+ID+"' ORDER BY Order_ID DESC";
      var query = db.query(sql, function(err , result){
         if(result.length>=0){
            res.render('show_cart_list.ejs', {
               message: "Recent ordered items"
               ,items: result
           });
         }else{
            res.render('show_cart_list.ejs', {
               message: "No items found"
           });
         }
      });
   }
}