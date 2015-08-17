var express = require('express');
var app = express();

app.use(express.static('www'));

var server = app.listen(3000, function () {
  var addr = server.address();
  console.log('Listening at http://%s:%s', addr.address, addr.port);
});
