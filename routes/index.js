/*
* GET home page.
*/
//-------------show all items in homepage-----------------

exports.call_index = function(req, res){
    if(req.session.user!=null){
          let query = "SELECT * FROM `foods` ORDER BY Food_ID ASC"; // query database to get all the players
          let message='';
          // execute query
          db.query(query, (err, result) => {
              if (err) {
                console.log('home error');
                  res.redirect('/');
              }else{
                console.log('home ok');
                message = 'Homepage';

                res.render('home.ejs', {
                    message: message
                    ,items: result
                });
              }
          });
    }else{
      //res.redirect('/');
      res.render('login.ejs',{message:""});
    }
}
