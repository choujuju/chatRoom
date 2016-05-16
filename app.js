var express = require('express');
var http = require('http'); 
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var signedCookieParser = cookieParser('chatRoom');
var session = require('express-session');
var Controllers = require('./controllers');
var async = require('async');
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
        res.json(user);
      };
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
        Controllers.User.online(user._id,function(err,user){
          if(err){
            res.json(500, {
              msg: err
            });
          } else {
            res.json(user);
          };
        });
      };
    });
  }else{
    res.json(403);
  };
});

app.get('/api/logout',function(req,res){
  var _userId = req.session._userId;
  Controllers.User.offline(_userId,function(err,user){
    if(err){
      res.json(500, {
        msg: err
      });
    } else {
      res.json(200);
      delete req.session._userId;
    };
  });
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

io.sockets.on('connection',function(socket){
  console.log('socket is connected');
  socket.on('getRoom',function(){
    async.parallel([
      function(done){
        Controllers.User.getOnlineUsers(done);
      },function(done){
        Controllers.Message.read(done);
      }],
      function(err,results){
        if (err){
          socket.emit('err',{
            msg:err
          });
        }else{
          socket.emit('roomData',{
            users: results[0],
            messages: results[1]
          });
        }
      });
  });
  socket.on('createMessage',function(message){
    Controllers.Message.create(message,function(err){
      if (err){
        socket.emit('err',{
          msg:err
        });
      }else{
        msg={
          content:message.message,
          creator:message.creator,
          createAt:new Date
        }
        io.sockets.emit('messageAdded',msg);
      }
    });
  });
  var _userId = socket.handshake.headers.session._userId;
  Controllers.User.online(_userId,function(err,user){
    if(err){
      socket.emit('err',{
        msg:err
      });
    }else {
      socket.broadcast.emit('online',user);
      socket.broadcast.emit('messageAdded',{
        content: user.name + '进入了聊天室',
        creator:'SYSTEM',
        createAt: new Date()
      });
    };
  });
  socket.on('disconnect',function(){
    Controllers.User.offline(_userId,function(err,user){
      if(err){
        socket.emit('err',{
          msg:err
        });
      }else{
        socket.broadcast.emit('offline',user);
        socket.broadcast.emit('messageAdded',{
        content: user.name + '离开了聊天室',
        creator:'SYSTEM',
        createAt: new Date()
      });
      };
    });
  });
});

io.set('authorization',function(handshakeData,accept){
  signedCookieParser(handshakeData,{},function(err){
    if (err) {
      accept(err,false);
    }else{
      sessionStore.get(handshakeData.signedCookies['connect.sid'], function(err,session){
        if (err){
          accept(err.message,false);
        }else{
          handshakeData.headers.session = session;
          if(session._userId){
            accept(null,true);
          }else {
            accept('No login');
          };
        };
      });
    };
  });
});

