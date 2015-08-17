var express = require('express');
var fs = require('fs');

var proj = process.env.PROJECT || '/tmp';
var app = express();

app.get('/map.json', function (req, res) {
  var map = fs.readFileSync(proj + '/map.json');
  res.send(map);
});

app.use(express.static('www'));

var server = app.listen(+(process.env.PORT || 3000), function () {
  var addr = server.address();
  console.log('Listening at http://%s:%s', addr.address, addr.port);
});
