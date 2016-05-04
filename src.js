var http = require('http'), express = require('express'), app = express();
var port = 8210;
app.use("/", express.static(__dirname+'/asset'));

http.createServer(app).listen(port, function() {
    console.log((new Date()) + ' Server is static files on port ' + port);
});