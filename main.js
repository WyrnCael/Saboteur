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
var multer = require("multer");
var upload = multer({ dest: "uploads/" });
var fs = require("fs");
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

app.get("/registro.html", function(req, response) {
  response.status(200);
  response.render("registro", {errores: undefined, datosNuevoUsuario: {} });
  response.end();
});

app.post("/procesar_fromulario_registro", upload.single("foto"), function(req, response) {
  var datos = req.body;
  req.checkBody("usuario", "El campo 'Nombre de usuario' no puede estar vacío.").notEmpty();
  req.checkBody("usuario", "El campo 'Nombre de usuario' no puede tener mas de 20 caracteres.").isLength({min : 0, max: 20});
  req.checkBody("contraseña", "El campo 'Contraseña' no puede estar vacío.").notEmpty();  
  req.checkBody("contraseña", "El campo 'Contraseña' no puede tener mas de 20 caracteres.").isLength({min : 0, max: 20});
  req.checkBody("nombre", "El campo 'Nombre completo' no puede estar vacío.").notEmpty();
  req.checkBody("nombre", "El campo 'Nombre completo' no puede tener mas de 20 caracteres.").isLength({min : 0, max: 20});
  req.checkBody("sexo", "Debe elegir un sexo.").notEmpty();
  if(datos.nacimiento !== "") req.checkBody("nacimiento", "La fecha de nacimiento no puede ser posterior a la actual.").isBefore();
  req.getValidationResult().then(function(result) {
    // El método isEmpty() devuelve true si las comprobaciones
    // no han detectado ningún error
    if (result.isEmpty()) {
        var urlFichero;
        if(req.file){
            urlFichero = path.join("img", req.file.filename);
            var fichDestino = path.join("public", urlFichero);
            fs.createReadStream(req.file.path).pipe(fs.createWriteStream(fichDestino));
            datos.foto = urlFichero;
        }
       
        DAO.altaUsuario(datos);
        response.status(300);
        response.redirect("/index.html");  
        response.end();
    } else {
        response.status(200);
        response.render("registro", {errores: result.array(), datosNuevoUsuario: datos });
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