var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var proj = process.env.PROJECT || '/tmp';
var app = express();

app.use(bodyParser.json());

app.get('/map.json', function (req, res) {
  var map = fs.readFileSync(proj + '/map.json');
  res.send(map);
});

app.post('/map.json', function(req, res) {
  var data = JSON.stringify(req.body, null, 2) + '\n';
  fs.writeFileSync(proj + '/map.json', data);
  res.send('ok');
});

app.use('/img', express.static(proj + '/img'));

app.use(express.static('www'));

var server = app.listen(+(process.env.PORT || 3000), function () {
  var addr = server.address();
  console.log('Listening at http://%s:%s', addr.address, addr.port);
});
