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
		scope: ['basic_read','sleep_read','users_read','move_read','heartrate_read'],
		failureRedirect: '/'
	})
);

app.get('/sleepdata',
	passport.authorize('jawbone', {
		scope: ['basic_read','sleep_read', 'users_read','move_read'],
		failureRedirect: '/'
	}), function(req, res) {
		res.render('userdata', req.account);
	}
);




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


        		jawboneDatamove.items[i].date = month + '/' + day + '/' + year;
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
    var collection = db.collection('steps17');

    //Create some users
    for (i = 0; i < jawboneDatamove.items.length; i++){
		var movedata = {steps: jawboneDatamove.items[i].title};
		var movedata2 = movedata['steps'];
		var movedata3 = parseFloat(movedata2.replace(/,/g,""));
		var movedata4 = {steps: movedata3}
		var date = {date: jawboneDatamove.items[i].date};
		collection.insert([movedata4, date]);
		
	}
	
		
	
	
  }
});
// end connect to mongo for move data


		}});
		
		// end move data
		
		
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


        		jawboneData.items[i].date = month + '/' + day + '/' + year;
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
    var collection = db.collection('sleep17');

    //Create some users
    for (i = 0; i < jawboneData.items.length; i++){
		var sleepdata = {sleep: jawboneData.items[i].title};
		var date = {date: jawboneData.items[i].date};
		var sleepdata1 = sleepdata['sleep']
		var hours = sleepdata1[0]
		var min1 = sleepdata1[3]
		var min2 = sleepdata1[4]
		var min = min1.concat(min2).replace('m','')
		var hrstomin = hours*60
		var totmin = parseInt(hrstomin) + parseInt(min)
		var totmin1 = {sleep_minutes: totmin}
		//console.log(totmin)
		collection.insert([totmin1, date]);
	}
	
		
	
	
  }
});
// end connect to mongo




			return done(null, jawboneData, console.log('Jawbone UP data ready to be displayed.'));
    	}
    
	});
}));

secureServer = https.createServer(sslOptions, app).listen(port, function(){
  	console.log('UP server listening on ' + port);
});