/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');
var path = require("path");
var ejs = require("ejs");
var app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + '/public'));

app.get("/index.html", function(req, response) {
  response.status(200);
  response.render("index");
  response.end();
});

app.listen(3000, function() {
console.log("Servidor arrancado en el puerto 3000");
});