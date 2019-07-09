var app = require('express')();
var http = require('http').Server(app);
var Consul = require('consul');

const port = process.env.CONSUL_URL;
var consulUrl = "127.0.0.1";
if (port != null) {
    consulUrl = process.env.CONSUL_URL;
}
console.log('consulUrl: ' + consulUrl);

app.get('/', function (req, res) {

    var objToJson = {
        purpose: "Benefits"
    };
    res.setHeader('content-type', 'text/javascript');
    res.send(objToJson);
});

app.get('/benefits', function (req, res) {

    var objToJson = {
        purpose: "Benefits Endpoint"
    };
    res.setHeader('content-type', 'text/javascript');
    res.send(objToJson);
});

http.listen(10004, function () {
    console.log('Listening on *:10004');
    console.log('http://localhost:10004/');
    console.log('http://localhost:10004/benefits');
});

var consul = new Consul({
    host: consulUrl,
    port: 8500
});

var service = "microservice-benefits-rest";

var check = {
    name: service,
    ttl: '15s',
    notes: 'This is an example check.'
};

consul.agent.service.register(service, function (err) {
    if (err) throw err;
});

consul.health.service(service, function (err, result) {
    if (err) throw err;
});

consul.agent.check.register(check, function (err) {
    if (err) throw err;
});

consul.agent.check.deregister(service, function (err) {
    if (err) throw err;
});

consul.agent.check.pass(service, function (err) {
    if (err) throw err;
});

var kvValue = {
    "version": "1.0",
    "dependencies": [{
            "name": "microservice-user-manager-rest",
            "version": "1.0"
        },
        {
            "name": "microservice-access-manager-rest",
            "version": "1.0"
        }
    ]
}

consul.kv.set(service, JSON.stringify(kvValue), function (err, result) {
    if (err) throw err;
});