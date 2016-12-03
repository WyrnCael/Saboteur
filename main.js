/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');
var expressValidator = require("express-validator");
var path = require("path");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var DAO = require('./DAO.js');
var app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + '/public'));
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/index.html", function(req, response) {
  response.status(200);
  response.render("index");
  response.end();
});

app.post("/registro_usuario", function(req, response) {
  DAO.altaUsuario(req.body);
  response.status(300);
  response.redirect("/index.html");  
  response.end();
});

app.get("/registro.html", function(req, response) {
  response.status(200);
  response.render("registro", {errores: []});
  response.end();
});

app.post("/procesar_fromulario_registro", function(req, response) {
  req.checkBody("datosNuevoUsuario[usuario]", "El campo 'Nombre de usuario' no puede estar vacío.").notEmpty();
  req.checkBody("datosNuevoUsuario[contraseña]", "El campo 'Contraseña' no puede estar vacío.").notEmpty();  
  req.checkBody("datosNuevoUsuario[nombre]", "El campo 'Nombre completo' no puede estar vacío.").notEmpty();
  req.checkBody("datosNuevoUsuario[sexo]", "Debe elegir un sexo.").notEmpty();
  req.checkBody("datosNuevoUsuario[nacimiento]", "La fecha de nacimiento no puede ser posterior a la actual.").isBefore();
  req.getValidationResult().then(function(result) {
    // El método isEmpty() devuelve true si las comprobaciones
    // no han detectado ningún error
    if (result.isEmpty()) {
        response.status(300);
        response.redirect("registro_usuario");        
        response.end();
    } else {
        response.status(200);
        response.render("registro", {errores: result.array()});
        response.end();
    }
  });  
});

app.get("/", function(req, response) {
  response.status(200);
  response.render("index");
  response.end();
});

app.listen(3000, function() {
console.log("Servidor arrancado en el puerto 3000");
});