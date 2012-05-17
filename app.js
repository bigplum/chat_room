var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var users = {};
var msgs = new Array();

io.sockets.on('connection', function (socket) {
  var address = socket.handshake.address;
  var addr = address.address + ":" + address.port
  console.log("new: " + addr);

  users[addr] = 2;
  socket.emit('users', users);
  users[addr] = 1;
  socket.broadcast.emit('join', addr);
  msgs.push(addr + " connected.");
  socket.emit('history', msgs);

  socket.on('msg', function (data) {
    console.log("msg: " + JSON.stringify(data));
    resp = addr + " - " + data;
    msgs.push(resp);
    socket.broadcast.emit('cast', resp);
  });

  socket.on('disconnect', function () {
    console.log("leave: " + addr);
    socket.broadcast.emit('leave', addr);
    msgs.push(addr + " disconnected.");
    delete users[addr];
  });

});
