
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('questions', { title: 'appacitive' });
};