/* 
 * GRUPO 111 - Rubén Casado y Juan José Prieto
 */
var express = require('express');
var expressValidator = require("express-validator");
var path = require("path");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var multer = require("multer");
var upload = multer({ storage: multer.memoryStorage() });
var fs = require("fs");
var session = require("express-session");
var mysqlSession = require("express-mysql-session");
var MySQLStore = mysqlSession(session);
var sessionStore = new MySQLStore({
    host:  "localhost", 
    user:  "root",
    password: "",
    database: "Saboteur"
});
var middlewareSession = session({
    saveUninitialized: false,
    secret: "Saboteur111",
    resave: false,
    store: sessionStore
});
var DAO = require('./DAO.js');
var app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + '/public'));
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(middlewareSession);


app.get("/index.html", function(req, response) {
  if(req.session.nick){
      response.status(300);
      response.redirect("/listaPartidas.html");
  }
  else{
      response.status(200);
      response.render("index", {session: req.session });
  
  }
   response.end();
});

app.get("/registro.html", function(req, response) {
  response.status(200);
  response.render("registro", {errores: undefined, datosNuevoUsuario: {}, session: req.session });
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
        if(req.file){
            datos.foto = req.file.buffer;
        }
       
        DAO.altaUsuario(datos, function(err){
            if(err){
                response.status(300);
                response.render("registro", {errores: [{ msg: "Nombre de usuario no disponible."}], datosNuevoUsuario: datos, session: req.session });
                response.end();
            }
            else{
                req.session.nick = datos.usuario;
                response.status(300);
                response.redirect("/listaPartidas.html");  
                response.end();
            }
        });       
    } else {
        response.status(200);
        response.render("registro", {errores: result.array(), datosNuevoUsuario: datos, session: req.session  });
        response.end();
    }
  });  
});

app.get("/", function(req, response) {
  response.status(300);
  response.redirect("/index.html");
  response.end();
});

app.get("/logout", function(request, response) {
   request.session.destroy();
   response.status(200);
    response.render("index", {session: {} });
    response.end();
});

app.post("/procesar_login", function(req, response) {
    DAO.login(req.body, function(err, user){
        if(err){
            // Login incorrecto
            console.log(err);
        }
        else{
            if(user){
                req.session.nick = user.Nick;
                response.status(300);
                response.redirect("/listaPartidas.html");
            } else{
                // Login incorrecto
                response.status(200);
                response.render("login", {session: req.session, errores: [{ msg: "Usuario o contraseña incorrectos."}]  });
            }
        }
        response.end();
    });
});

app.get("/listaPartidas.html", function(req, response) {
    response.status(200);
    DAO.obtenerPartidasCreadasPor(req.session.nick, function(error, datosPartida){
        if(error){
            console.log(error);
        }
        else{
            response.render("listaPartidas", {session: req.session, datosPartida: datosPartida });
            response.end();
        }
    });
    
});

app.get("/creaPartida.html", function(req, response) {
    response.status(200);
    response.render("creaPartida", {session: req.session });
    response.end();
});

app.post("/procesar_creacion_partida", function(req, response) {
    var datosPartida = {};
    datosPartida.nombre = req.body.nombrePartida;
    datosPartida.creador = req.session.nick;
    datosPartida.maxJugadores = req.body.numeroJugadores;
    
    DAO.crearPartida(datosPartida, function(err, user){
        if(err){
            console.log(err);
        }
        else{
            response.status(300);
            response.redirect("/index.html");            
        }
        response.end();
    });
});

app.get("/unirsePartida.html", function(req, response) {
    
    var partidaJugadores = [];
    DAO.obtenerPartidasAbiertas(function(err, partidasAbiertas){
        if(err){
            console.log(err);
        }
        else{
            response.status(200);
            
            partidasAbiertas.forEach(function(p){
                DAO.obtenerJugadoresPartida(p.Nombre, function(err, jugadores){
                  if (err){
                      console.log(err);
                  }
                  else
                      partidaJugadores[p.Nombre] = jugadores;
                  console.log(jugadores);
              });
              
          });
          console.log(partidaJugadores);
            response.render("unirsePartida", {session: req.session, datosPartida: partidasAbiertas, jugadores: partidaJugadores});
            response.end();
        }
    });
    
    
});

app.post("/procesar_unirse_partida", function(req, response){
    
    DAO.insertJugadorEnPartida(req.session.nick, req.body.Nombre, function(err){
        if(err){
            console.log(err);
            response.redirect("/unirsePartida.html");   
        }
        else{
            response.status(300);
            //response.redirect("/unirsePartida.html");            
        }
        response.end();
    });
    console.log(req.body.Nombre);
})

app.get("/imagen/:nick", function(request, response, next) {
   var n = String(request.params.nick);
   
    DAO.obtenerImagenUsuario(n, function(err, imagen) {
        if(err) {
            next(err);
        } else {
            if(imagen) {
                response.end(imagen);
            }
            else{
                urlAvatar = path.join("img", "avatarDefault.png");
                var fichDestino = path.join("public", urlAvatar);
                fs.createReadStream(fichDestino).pipe(response);
            }
        }
     });
});



app.listen(3000, function() {
console.log("Servidor arrancado en el puerto 3000");
});