var express = require('express');
var http = require('http'); 
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var signedCookieParser = cookieParser('chatRoom');
var session = require('express-session');
var Controllers = require('./controllers');
var MongoStore = require('connect-mongo')(session);
var sessionStore = new MongoStore({
  url:'mongodb://localhost/chatRoom'
});

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret:'chatRoom',
    resave:true,
    saveUninitialized:false,
    cookie:{
      maxAge:60 * 1000* 60
    },
    store: sessionStore
  }));

app.get('/api/validate',function(req,res){
  var _userId = req.session._userId;
  if (_userId){
    Controllers.User.findUserById(_userId,function(err,user){
      if (err) {
        res.json(401, {
          msg: err
        });
      }else{
        res.json(user)
      }
    });
  }else{
    res.json(401,null);
  }
});

app.post('/api/login',function(req,res){
  var email = req.body.email;
  if (email) {
    Controllers.User.findByEmailOrCreate(email,function(err,user){
      if(err) {
        res.json(500,{
          msg:err
        });
      }else{
        req.session._userId = user._id;
        res.json(user);
      }
    });
  }else{
    res.json(403);
  }
});

app.get('/api/logout',function(req,res){
  req.session._userId = null;
  res.json(401);
});

app.use(express.static(path.join(__dirname, '/static')));
app.use(function(err,req,res){
  req.sendFile(path.join(__dirname,'/static/index.html'));
});

var port = process.env.PORT || '3000';
app.set('port', port);

var server = app.listen(app.get('port'),function(){
  console.log('chatRoom is on port '+port+'!');
});

var io = require('socket.io').listen(server);
var messages = [];

io.set('authorization',function(handshakeData,accept){
  signedCookieParser(handshakeData,{},function(err){
    //console.log('*>',handshakeData);
    if (err) {
      accept(err,false);
    }else{
      sessionStore.get(handshakeData.signedCookies['connect.sid'], function(err,session){
        if (err){
          accept(err.message,false);
        }else{
          handshakeData.session = session;
          if(session._userId){
            accept(null,true);
          }else {
            accept('No login');
          }
        }
      });
    }
  });
});

io.sockets.on('connection',function(socket){
  console.log('socket is connected');
  socket.on('getAllMessages',function(){
    socket.emit('allMessages',messages);
  });
  socket.on('createMessage',function(message){
    messages.push(message);
    socket.emit('messageAdded',message);
  });
});
