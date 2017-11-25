const net = require('net');

module.exports = {
    // get avaliable port
    getPort(from, cb) {
        var port = from
        from += 1

        var server = net.createServer();
        server.listen(port, function (err) {
            server.once('close', function () {
                cb(port);
            });
            server.close();
        });
        server.on('error', function (err) {
            getPort(from, cb)
        });
    }
}