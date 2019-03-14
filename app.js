require('dotenv').config();

var PORT = process.env.PORT || 3434;

var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic("dist")).listen(PORT, function(){
    console.log("Server running on " + PORT);
});
