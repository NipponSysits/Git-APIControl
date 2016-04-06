module.exports = function(push) {
  push.accept(function(){ 
    
    console.log('push ' + push.repo + '/' + push.commit + ' (' + push.branch + ')');
  });
}