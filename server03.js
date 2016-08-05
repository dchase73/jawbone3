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
	url = 'mongodb://localhost:27017/dennis4';
	
	jawboneAuth = {
       clientID: '4ee4_90oPD4',
       clientSecret: 'a2f649754b1dfccc0dd62fa398839b2a65754d5c',
       authorizationURL: 'https://jawbone.com/auth/oauth2/auth',
       tokenURL: 'https://jawbone.com/auth/oauth2/token',
       callbackURL: 'https://localhost:5000/movedata',
	   
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
		scope: ['basic_read','move_read'],
		failureRedirect: '/'
	})
);



// add move get 
app.get('/movedata',
	passport.authorize('jawbone', {
		scope: ['basic_read','move_read'],
		failureRedirect: '/'
	}), function(req, res) {
		res.render('userdata', req.account);
	}
);
// end move get

// add user get 
app.get('/usersdata',
	passport.authorize('jawbone', {
		scope: ['basic_read','users_read'],
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

		//move data
		up.moves.get({}, function(err, body) {
    	if (err) {
    		console.log('Error receiving Jawbone UP data');
    	} else {
    		jawboneDatamove = JSON.parse(body).data;
			
        	for (i = 0; i < jawboneDatamove.items.length; i++) {
        		    date = jawboneDatamove.items[i].date.toString(),
        			year = date.slice(0,4),
        			month = date.slice(4,6),
        			day = date.slice(6,8);


        		jawboneDatamove.items[i].date = day + '/' + month + '/' + year;
        		jawboneDatamove.items[i].title = jawboneDatamove.items[i].title.replace('for ', '');
        
			
			}
			// connect to mongo for move		
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    // Get the documents collection
    var collection = db.collection('steps5');

    //Create some users
    for (i = 0; i < jawboneDatamove.items.length; i++){
		var movedata = {steps: jawboneDatamove.items[i].title};
		var date = {date: jawboneDatamove.items[i].date};
		collection.insert([movedata]);
	}
	
		return done(null, jawboneDatamove, console.log('Jawbonemove UP data ready to be displayed.'));
	
	
  }
});
// end connect to mongo for move data


		}});
		
		// end move data
		
		

}));

secureServer = https.createServer(sslOptions, app).listen(port, function(){
  	console.log('UP server listening on ' + port);
});