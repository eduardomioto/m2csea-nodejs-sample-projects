const express = require('express')
const app = express();
const responseTime = require('express-response-time')

var http = require('http').Server(app);
var Consul = require('consul');

const port = process.env.CONSUL_URL;
var consulUrl = "127.0.0.1";
if (port != null) {
    consulUrl = process.env.CONSUL_URL;
}
console.log('consulUrl: ' + consulUrl);

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'm2csea-metrics'
});

function saveMetrics(microservice, responseTime) {
    connection.connect();

    var query = "INSERT INTO response_time (microservice, response_time) VALUES ('"
    query += microservice;
    query += "',";
    query += responseTime;
    query += ")";

    connection.query(query, function (err, rows, fields) {
        if (err) throw err;
        connection.end();
    });

}

app.use(responseTime((methond, url, time) => {
    saveMetrics("microservice-banner-rest", time);
    console.log(methond + " " + url + " " + time)
}))

app.get('/', function (req, res) {

    var objToJson = {
        purpose: "Banner"
    };
    res.setHeader('content-type', 'application/json');
    res.send(objToJson);
});

app.get('/banner', function (req, res) {

    console.log("/banner")
    var objToJson = {
        purpose: "Banner Endpoint"
    };

    res.setHeader('content-type', 'application/json');
    res.send(objToJson);
});

http.listen(10002, function () {
    console.log('Listening on *:10002');
    console.log('http://localhost:10002/');
    console.log('http://localhost:10002/banner');
});

var consul = new Consul({
    host: consulUrl,
    port: 8500
});

var service = "microservice-banner-rest";

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
        "name": "microservice-calendar-rest",
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