const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const tail = require('tail');

// Run the webserver on port 8080
server.listen(8080);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Add Socket.io clients
io.on('connection', function (socket) {
    console.log('Browser client connected')
    
    socket.on('start', function (data) {
        let logfile = new tail.Tail(data.logfile)
        let counter = 0

        logfile.on('line', function (line) {
            socket.emit('add-data', { id: ++counter, line: line })
        }).on('error', function (error) {
            console.log('ERROR: ', error);
        });

        console.log('Started watching logfile: ' + data.logfile);

        socket.on('disconnect', function (data) {
            console.log('Logfile watch disabled.')
            logfile.unwatch()
        })

    })

    socket.on('disconnect', function (data) {
        console.log('Client disconnected.')
    })
});