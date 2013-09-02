
/*
 * GET users listing.
 */

exports.index = function(req, res){
  res.render('users', { title: 'appacitive' });
};