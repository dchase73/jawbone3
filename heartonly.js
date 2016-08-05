express = require('express'),
	app = express(),
	ejs = require('ejs'),
	https = require('https'),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	JawboneStrategy = require('passport-oauth').OAuth2Strategy,
	port = 5000,
	mongodb = require('mongodb');
	MongoClient = mongodb.MongoClient;
	url = 'mongodb://ods:ods123@ds059215.mongolab.com:59215/test1';
	
	jawboneAuth = {
       clientID: '4ee4_90oPD4',
       clientSecret: 'a2f649754b1dfccc0dd62fa398839b2a65754d5c',
       authorizationURL: 'https://jawbone.com/auth/oauth2/auth',
       tokenURL: 'https://jawbone.com/auth/oauth2/token',
       callbackURL: 'https://localhost:5000/sleepdata'
    },
	sslOptions = {
		key: fs.readFileSync('./server.key'),
		cert: fs.readFileSync('./server.crt')
	};

	app.use(bodyParser.json());

	app.use(express.static(__dirname + '/public'));

	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');

// ----- Passport set up ----- //
app.use(passport.initialize());

app.get('/login/jawbone', 
	passport.authorize('jawbone', {
		scope: ['basic_read','heartrate_read'],
		failureRedirect: '/'
	})
);





// add user get 
app.get('/sleepdata',
	passport.authorize('jawbone', {
		scope: ['basic_read','heartrate_read'],
		failureRedirect: '/'
	}), function(req, res) {
		res.render('userdata', req.account);
	}
);
// end user get



app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/', function(req, res) {
	res.render('index');
});

passport.use('jawbone', new JawboneStrategy({
	clientID: jawboneAuth.clientID,
	clientSecret: jawboneAuth.clientSecret,
	authorizationURL: jawboneAuth.authorizationURL,
	tokenURL: jawboneAuth.tokenURL,
	callbackURL: jawboneAuth.callbackURL
}, function(token, refreshToken, profile, done) {
	options = {
			access_token: token,
			client_id: jawboneAuth.clientID,
			client_secret: jawboneAuth.clientSecret
		},
		up = require('jawbone-up')(options);

		
	//heart data
		up.heart_rates.get({}, function(err, body) {
    	if (err) {
    		console.log('Error receiving Jawbone UP data');
    	} else {
    		jawboneDataheart = JSON.parse(body).data;
			
        	for (i = 0; i < jawboneDataheart.items.length; i++) {
        		    date = jawboneDataheart.items[i].date.toString(),
        			year = date.slice(0,4),
        			month = date.slice(4,6),
        			day = date.slice(6,8);


        		jawboneDataheart.items[i].date = month + '/' + day + '/' + year;
        		jawboneDataheart.items[i].title = jawboneDataheart.items[i].title.replace('for ', '');
        
			
		}}});
			// end heart data
		
		
		
			
		
		
		
		
		
	
}));

secureServer = https.createServer(sslOptions, app).listen(port, function(){
  	console.log('UP server listening on ' + port);
});



