module.exports = function(tag) {
  if(typeof tag.commit != 'undefined') {
    console.log('tag ' + tag.repo + '/' + tag.commit);
  }
  tag.accept();
}