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
var service = "microservice-category-rest";

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'mysql',
    port: '3306',
    user: 'root',
    password: 'admin',
    database: 'm2csea-metrics'
});

function saveMetrics(microservice, responseTime) {
    var query = "INSERT INTO response_time (microservice, response_time, dt_transaction) VALUES ('"
    query += microservice;
    query += "',";
    query += responseTime;
    query += ", NOW())";

    connection.query(query, function(err, result){
        console.log(err, result)
    }).on('error', function(err) {
        console.log("[mysql error]",err);
    });

}

app.use(responseTime((methond, url, time) => {
    saveMetrics(service, time);
    console.log(methond + " " + url + " " + time)
}))

app.get('/', function (req, res) {

    var objToJson = {
        purpose: "Category"
    };
    res.setHeader('content-type', 'text/javascript');
    res.send(objToJson);
});

app.get('/category', function (req, res) {

    var objToJson = {
        purpose: "Category Endpoint"
    };
    res.setHeader('content-type', 'text/javascript');
    res.send(objToJson);
});

http.listen(10007, function () {
    console.log('Listening on *:10007');
    console.log('http://localhost:10007/');
    console.log('http://localhost:10007/category');
});

var consul = new Consul({
    host: consulUrl,
    port: 8500
});



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
        "name": "microservice-access-manager-rest",
        "version": "1.0"
    }]
}
consul.kv.set(service, JSON.stringify(kvValue), function (err, result) {
    if (err) throw err;
});