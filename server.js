var express = require('express'),
app = express();

	app.use(express.static(__dirname+'/deploy/'))
	.get('*', function(req, res){

	res.sendFile('/deploy/index.html', {root:__dirname});
	
 }).listen(78);

	console.log('se estan enviando las peticiones...');