//-----------------------admin login call--------------------------------
exports.admin_login = function(req, res){
    var message = '';
    var sess = req.session;
    
    if(req.method == "POST"){
       var post  = req.body;
       var email= post.userid;
       var pass= post.password;
       
       var sql="SELECT * FROM `admin` WHERE Email ='"+email+"' AND Password ='"+pass+"'  ";                           
       db.query(sql, function(err, results){     
          if(results.length>0){
             req.session.userId = results[0].Email;
             req.session.ssadmin = results[0];
             res.locals.ssadmin = req.session.userId;
             console.log('admin login ok');
             res.render("./admin/admin_home.ejs");
          }
          else{
             message = 'Wrong Credentials.';
             res.render('./admin/admin_login.ejs',{message: message});
          }
                  
       });
    } else {
        var userId = res.locals.ssadmin;
        if(userId){
            res.render("./admin/admin_home.ejs",{data:userId});
        }
        else{
            res.render('./admin/admin_login.ejs',{message: message});
            return;
        }
       
    }
            
 };
 //------------------------------------logout functionality----------------------------------------------
 exports.logout=function(req,res){
    req.session.destroy(function(err) {
       res.redirect("/admin");
    })
 };
 //---------------------------------------Adding items-----------------------------------
 exports.add_items = function(req, res){
    console.log(req.session.ssadmin);
    if(req.session.ssadmin!=null){
        
                if(req.method == "POST"){
                    if (!req.files) {
                        return res.status(400).send("No files were uploaded.");
                    }

                    let message = '';
                    let fname = req.body.fname;
                    let price = req.body.price;
                    let catagory = req.body.catagory;
                    let details = req.body.details;
                    let avail = req.body.availability;

                    let uploadedFile = req.files.image;
                    let image_name = uploadedFile.name;
                    let fileExtension = uploadedFile.mimetype.split('/')[1];
                    image_name = fname + '.' + fileExtension;

                    
                    // check the filetype before uploading it
                    if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                        // upload the file to the /public/assets/img directory
                        uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            // send the player's details to the database
                            let query = "INSERT INTO `foods` (Food_Name, Catagory_Name, Details, Price, image, Availability) VALUES ('" +
                                fname + "', '" + catagory + "', '" + details + "', '" + price + "', '" + image_name + "', '" + avail + "')";
                            db.query(query, (err, result) => {
                                if (err) {
                                    return res.status(500).send(err);
                                }
                                res.redirect('/admin');
                            });
                        });
                    } else {
                        message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                        res.send({message: message});
                        res.redirect('/admin/add_items');
                    }
                }else{
                    message = "Something went wrong!!";
                    res.render("./admin/adding_items.ejs",{ });
                }
    }else{
        res.render("./admin/admin_login.ejs",{ });
    }
};
//-----------------------------------show all-------------------
exports.show_all_items=function(req,res){
    console.log(req.session.ssadmin);
    if(req.session.ssadmin!=null){

        var sql = "SELECT * FROM `foods` ORDER BY Food_ID ASC";
        db.query(sql, function(err, results) {
            if (err) {
            res.status(500).send({ error: 'Something failed!' })
            }
            //res.json(rows);
            res.render('./admin/admin_show_all.ejs',{rows: results});
        })


    }else{
        res.render("./admin/admin_login.ejs",{ message: ''});
    }
};
//-------------------------Edit Items page-----------------------------
exports.edit_items = function(req,res){
    console.log('edit call' + res.locals.ssadmin);
    if(res.locals.ssadmin!=null){

            let id = req.params.id;
            var sql = "SELECT * FROM `foods` WHERE `Food_ID`= '"+id+"' ";
            db.query(sql, function(err, results) {
                if (err) {
                res.status(500).send({ error: 'Something failed!' })
                }
                //res.json(rows);
                let result = results[0];
                console.log(result);
                res.render('./admin/edit_item_page.ejs',{row: result});
            })

    }else{
        res.render("./admin/admin_login.ejs",{ message: ''});
    }
};
//-----------------------------------Update  items-------------------
exports.update_photo = function(req,res){
    console.log(res.locals.ssadmin);
    if(res.locals.ssadmin!=null){
        if(req.method == "POST"){

            let message = '';
            let id = req.params.id;
            let fname = req.body.name;
            console.log(id);
            let uploadedFile = req.files.image;
                    let image_name = uploadedFile.name;
                    let fileExtension = uploadedFile.mimetype.split('/')[1];
                    image_name = fname + '.' + fileExtension;

            if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                // upload the file to the /public/assets/img directory
                uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    // send the player's details to the database
                    let query = "UPDATE `foods` SET `Image`='" + image_name + "' WHERE `Food_ID`='" + id + "'";
                    db.query(query, (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        res.redirect('/admin/show_all');
                    });
                });
            } else {
                message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                console.log(message);
                res.send({message: message});
                res.redirect('/admin/show_all');
            }

        }

    }else{
        res.render("./admin/admin_login.ejs",{ message: ''});
    }
};
//----------------Update items------------------------
exports.update_items = function(req,res){
    console.log(res.locals.ssadmin);
    if(res.locals.ssadmin!=null){
        if(req.method == "POST"){

            let message = '';
            let id = req.params.id;
            let name = req.body.name;
            let price = req.body.price;
            let catagory = req.body.catagory;
            let details = req.body.details;
            let avail = req.body.availability;
            console.log(id + " " +name + " " +price+ " " +catagory+ " " +details+ " " +avail);
            let query = "UPDATE `foods` SET `Food_Name`='" +name+ "', `Catagory_Name`='" + catagory + "', `Details`='" + details + "' , `Price`='" + price + "' , `Availability`= '" + avail + "' WHERE `Food_ID`='" + id + "'";
            
            db.query(query, (err, results) => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.redirect('/admin/show_all');
            });

        }

    }else{
        res.render("./admin/admin_login.ejs",{ message: ''});
    }
}
//--------------Order list-------------------
exports.order_list = function(req, res){
    if(req.session.ssadmin!=null){
  
        var sql = "SELECT * FROM `order_list` ORDER BY Order_ID DESC";
        var query = db.query(sql, function(err , result){
           if(result.length>=0){
              res.render('./admin/admin_order_list.ejs', {
                 message: "Recent ordered items"
                 ,items: result
             });
           }else{
              res.render('./admin/admin_order_list.ejs', {
                 message: "No items found"
             });
           }
        });
     }
}