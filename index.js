var express = require('express');
var app = express();
var bodyParser  = require('body-parser');

var options = require('./options');

var frameRoot = require('./src/frames/index');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/:frame', function (req, res) {
  frameRoot(req.params.frame, function (html) {
    res.send(html);
  });
});

app.listen(options.port, function () {
  console.log('Example app listening on port ' + options.port);
});

