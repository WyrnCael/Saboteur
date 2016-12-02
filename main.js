/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');
var path = require("path");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var DAO = require('./DAO.js');
var app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/index.html", function(req, response) {
  response.status(200);
  response.render("index");
  response.end();
});

app.post("/index_post.html", function(req, response) {
  DAO.altaUsuario(req.body);
  response.status(300);
  response.redirect("/index.html");  
  response.end();
});

app.get("/registro.html", function(req, response) {
  response.status(200);
  response.render("registro");
  response.end();
});

app.get("/", function(req, response) {
  response.status(200);
  response.render("index");
  response.end();
});

app.listen(3000, function() {
console.log("Servidor arrancado en el puerto 3000");
});