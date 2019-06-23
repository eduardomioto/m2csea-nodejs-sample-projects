var app = require('express')();
var http = require('http').Server(app);
var Consul = require('consul');

var consulUrl = "127.0.0.1";
console.log('consulUrl: '+ consulUrl);

app.get('/', function(req, res){

    var objToJson = {
        purpose: "Calendar"
    };
    res.setHeader('content-type', 'text/javascript');
    res.send(objToJson);
});

app.get('/calendar', function(req, res){

    var objToJson = {
        purpose: "Calendar Endpoint"
    };
    res.setHeader('content-type', 'text/javascript');
    res.send(objToJson);
});

http.listen(10006, function(){
    console.log('Listening on *:10006');
    console.log('http://localhost:10006/');
    console.log('http://localhost:10006/calendar');
});

var consul = new Consul({
    host: consulUrl,
    port: 8500
});

var service = "microservice-calendar-rest";

var check = {
    name: service,
    ttl: '15s',
    notes: 'This is an example check.'
};

consul.agent.service.register(service, function(err) {
    if (err) throw err;
});

consul.health.service(service, function(err, result) {
    if (err) throw err;
});

consul.agent.check.register(check, function(err) {
    if (err) throw err;
});

consul.agent.check.deregister(service, function(err) {
    if (err) throw err;
});

consul.agent.check.pass(service, function(err) {
    if (err) throw err;
});

var kvValue = {
    "version":"1.0",
    "dependencies":[
        {
            "name":"microservice-access-manager-rest",
            "version":"1.0"
        }
    ]
}

consul.kv.set(service, JSON.stringify(kvValue), function(err, result) {
    if (err) throw err;
});