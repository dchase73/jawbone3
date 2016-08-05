    express = require('express'),
	app = express(),
	ejs = require('ejs'),
	https = require('https'),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	JawboneStrategy = require('passport-oauth').OAuth2Strategy,
	port = 5001,
	mongodb = require('mongodb');
	
	MongoClient = mongodb.MongoClient;
	url = 'mongodb://localhost:27017/dennis4';
	
	jawboneAuth = {
       clientID: '4ee4_90oPD4',
       clientSecret: 'a2f649754b1dfccc0dd62fa398839b2a65754d5c',
       authorizationURL: 'https://jawbone.com/auth/oauth2/auth',
       tokenURL: 'https://jawbone.com/auth/oauth2/token',
       callbackURL: 'https://localhost:5001/sleepdata',
	   
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
		scope: ['basic_read','sleep_read'],
		failureRedirect: '/'
	})
);

app.get('/sleepdata',
	passport.authorize('jawbone', {
		scope: ['basic_read','sleep_read'],
		failureRedirect: '/'
	}), function(req, res) {
		res.render('userdata2', req.account);
	}
);



// add user get 
app.get('/usersdata',
	passport.authorize('jawbone', {
		scope: ['basic_read','users_read'],
		failureRedirect: '/'
	}), function(req, res) {
		res.render('userdata2', req.account);
	}
);
// end user get



app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/', function(req, res) {
	res.render('index2');
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

		
	
		
		
	up.sleeps.get({}, function(err, body) {
   	if (err) {
   		console.log('Error receiving Jawbone UP data');
   	} else {
   		jawboneData = JSON.parse(body).data;
			
        	for (i = 0; i < jawboneData.items.length; i++) {
        		    date = jawboneData.items[i].date.toString(),
        			year = date.slice(0,4),
        			month = date.slice(4,6),
        			day = date.slice(6,8);


        		jawboneData.items[i].date = day + '/' + month + '/' + year;
        		jawboneData.items[i].title = jawboneData.items[i].title.replace('for ', '');
        	}
			
			
			
			
	// connect to mongo		
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
 } else {
    //HURRAY!! We are connected. :)
   console.log('Connection established to', url);

  // Get the documents collection
    var collection = db.collection('sleep4');

    //Create some users
    for (i = 0; i < jawboneData.items.length; i++){
		var sleepdata = {sleep: jawboneData.items[i].title};
		var date = {date: jawboneData.items[i].date};
		collection.insert([sleepdata, date]);
	}
	
		
	
	
  }
});
 //end connect to mongo




			return done(null, jawboneData, console.log('Jawbone UP data ready to be displayed.'));
			
		}
    
	});
}));

secureServer = https.createServer(sslOptions, app).listen(port, function(){
  	console.log('UP server listening on ' + port);
});