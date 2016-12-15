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
var DAO = require('./DAO.js');
var logica = require('./logica.js');
var config = require('./config.js');
var partida = require('./partida.js');
var app = express();

var sessionStore = new MySQLStore({
    host:  config.dbHost, 
    user:  config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
var middlewareSession = session({
    saveUninitialized: false,
    secret: "Saboteur111",
    resave: false,
    store: sessionStore
});
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

app.get("/login.html", function(req, response) {
  response.status(200);
  response.render("login", {errores: undefined, datosNuevoUsuario: {}, session: req.session });
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
                req.session.sexo = datos.sexo;
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
            response.status(500);
            response.render("500", {session: req.session, err: { mensaje: err.message, detalle: err.stack }  });
        }
        else{
            if(user){
                req.session.nick = user.Nick;
                req.session.sexo = user.Sexo;
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
    if(req.session.nick){
        DAO.obtenerPartidasCreadasPor(req.session.nick, function(error, datosPartida){
            if(error){
                console.log(error);
            }
            else{
                DAO.obtenerPartidasActivas(req.session.nick, function(err, partidasActivas){
                    if(err){
                        console.log(err);
                    }
                    else{
                        DAO.obtenerPartidasTerminadas(req.session.nick, function(err, partidasTerminadas){
                            if(err){
                                console.log(err);
                            }
                            else{
                                response.status(200);
                                response.render("listaPartidas", {session: req.session, datosPartida: datosPartida, partidasActivas: partidasActivas, partidasTerminadas: partidasTerminadas });
                                response.end();
                            }
                        });
                    }
                });

            }
        });
    }else{
        response.status(404);
        response.render("404", {errores: undefined, session: req.session});
        response.end();
    }
    
    
});

app.get("/creaPartida.html", function(req, response) {
    response.status(200);
    response.render("creaPartida", {errores: undefined, session: req.session });
    response.end();
});

app.post("/procesar_creacion_partida", function(req, response) {
    req.checkBody("nombrePartida", "El campo 'Nombre no puede estar vacío.").notEmpty();
    req.checkBody("nombrePartida", "El campo 'Nombre' no puede tener mas de 20 caracteres.").isLength({min : 0, max: 20});                
    req.getValidationResult().then(function(result) {
        if (result.isEmpty()) {
            var datosPartida = {};
            datosPartida.nombre = req.body.nombrePartida;
            datosPartida.creador = req.session.nick;
            datosPartida.maxJugadores = req.body.numeroJugadores;
            DAO.crearPartida(datosPartida, function(err, user){
                if(err){
                    response.status(200);
                    response.render("creaPartida", {errores: [{ msg: "El nombre de partida no está disponible."}], session: req.session });
                }
                else{
                    response.status(300);
                    response.redirect("/index.html");            
                }
                response.end();
            });
        }
        else{
            response.status(200);
            response.render("creaPartida", {errores: result.array(), session: req.session });
        }    
    });
});

app.get("/unirsePartida.html", function(req, response) {
    DAO.obtenerPartidasAbiertas(req.session.nick, function(err, partidasAbiertas){
        if(err){
            console.log(err);
        }
        else{
            partidasAbiertas.filter(function(p){
                p.Jugadores.forEach(function(j, indexJ, arrayJ){
                    var encontrado = false;
                    if(j.Nick === req.session.nick){
                       encontrado = true;
                    }
                    if(indexJ === arrayJ.length - 1){
                         return encontrado;
                    }
                });
            });
            response.status(200);
            response.render("unirsePartida", {session: req.session, datosPartida: partidasAbiertas});
            response.end();  
            
            
        }
    });
    
    
});

app.post("/procesar_unirse_partida", function(req, response){
    
    DAO.insertJugadorEnPartida(req.session.nick, req.body.Nombre, function(err){
        if(err){
            console.log(err);  
        }
        else{
            if(parseInt(req.body.NumJugadores) + 1 === parseInt(req.body.MaxJugadores)){
                var partidas = [];
                partidas[0] = {};
                partidas[0].Nombre = req.body.Nombre;
                DAO.iniciaPartida(partidas, function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        response.status(300);
                        response.redirect("/index.html");   
                        response.end();
                    }
                });
            }
            else{
                response.status(300);
                response.redirect("/index.html");                
                response.end();
            }                        
        }
    });
});

app.post("/procesar_cerrar_partida", function(req, response){
    
    var partidas = [];
    partidas[0] = {};
    partidas[0].Nombre = req.body.Nombre;
    DAO.iniciaPartida(partidas, function(err){
        if(err){
            console.log(err);
        }
        else{
            response.status(300);
            response.redirect("/index.html");   
            response.end();
        }
    });
});

app.get("/partida.html", function(req, response){
   DAO.obtenerPartida(req.query.Nombre, function(err, datosPartida){
        if(err){
            console.log(err);
        } 
        else{
            var jugadorEnPartida = false;
            datosPartida[0].Jugadores.forEach(function(p, index, array){
                if(p.Nick === req.session.nick){ jugadorEnPartida = true; }
                if(index === array.length - 1){
                    if(jugadorEnPartida){                        
                        DAO.obtenerCartasDisponiblesJugadorPartida(req.session.nick, req.query.Nombre, function(err, cartas){
                            if(err){
                                console.log(err);
                            }
                            else{
                                DAO.obtenerCartasTablero(req.query.Nombre, function(err, cartasTablero){
                                    if(err){
                                        console.log(err);
                                    }
                                    else{
                                        var tablero = new Array(7);
                                        for (var i = 0; i < 7; i++) {
                                          tablero[i] = new Array(7);
                                        }
                                        cartasTablero.forEach(function(p){
                                            // Ocultamos las casillas finales
                                            if(p.Valor === 21 || p.Valor === 22){
                                                p.Valor = 23;
                                            }
                                            tablero[p.PosX][p.PosY] = p;
                                        });

                                        // Mostarmos las casillas finales si la ha revelado
                                        // con la lupa
                                        cartas.forEach(function(p){
                                           if(p.Valor === 21 || p.Valor === 22){
                                               tablero[p.PosX][p.PosY] = p;
                                           } 
                                        });

                                        DAO.obtenerComentariosPartida(req.query.Nombre, function(err, comentarios){
                                            if(err)
                                                console.log(err);
                                            else{
                                                response.status(200);
                                                response.render("partida", {errores: undefined, session: req.session, datosPartida: datosPartida[0], cartas: cartas, tablero: tablero, comentarios: comentarios});                
                                                response.end();
                                            }
                                        });                            
                                    }
                                });
                            }
                        });            
                    }
                    else{
                        // Si el usuario no pertenece a la partida no se le muestra.
                        response.status(404);
                        response.render("404", {errores: undefined, session: req.session});
                        response.end();
                    }                    
                }
            });
            
        }
   });    
});

app.get("/partidaTerminada.html", function(req, res){
    DAO.obtenerPartida(req.query.Nombre, function(err, datosPartida){
        if(err)
            console.log(err);
        else{
            var jugadorEnPartida = false;
            datosPartida[0].Jugadores.forEach(function(p, index, array){
                if(p.Nick === req.session.nick){ jugadorEnPartida = true; }
                if(index === array.length - 1){
                    if(jugadorEnPartida){
                        DAO.obtenerCartasDisponiblesJugadorPartida(req.session.nick, req.query.Nombre, function(err, cartas){
                            if(err){
                                console.log(err);
                            }
                            else{
                                DAO.obtenerCartasTablero(req.query.Nombre, function(err, cartasTablero){
                                    if(err){
                                        console.log(err);
                                    }
                                    else{
                                        var tablero = new Array(7);
                                        for (var i = 0; i < 7; i++) {
                                          tablero[i] = new Array(7);
                                        }
                                        cartasTablero.forEach(function(p){
                                            // Ocultamos las casillas finales
                                            if(p.Valor === 21 || p.Valor === 22){
                                                p.Valor = 23;
                                            }
                                            tablero[p.PosX][p.PosY] = p;
                                        });

                                        // Mostarmos las casillas finales si la ha revelado
                                        // con la lupa
                                        cartas.forEach(function(p){
                                           if(p.Valor === 21 || p.Valor === 22){
                                               tablero[p.PosX][p.PosY] = p;
                                           } 
                                        });

                                        DAO.obtenerComentariosPartida(req.query.Nombre, function(err, comentarios){
                                            if(err)
                                                console.log(err);
                                            else{
                                                res.status(200);
                                                res.render("partidaTerminada", {errores: undefined, session: req.session, datosPartida: datosPartida[0], cartas: cartas, tablero: tablero, comentarios: comentarios});                
                                                res.end();
                                            }
                                        });                            
                                    }
                                });
                            }
                        }); 
                    } 
                    else{
                        // Si el usuario no pertenece a la partida no se le muestra.
                        res.status(404);
                        res.render("404", {errores: undefined, session: req.session});
                        res.end(); 
                    }
                }
            });
        }
    });
});

app.post("/procesar_carta_seleccionada", function(req, response){
    var datosPartida = JSON.parse(req.body.DatosPartida.toString());
    DAO.obtenerCartasTablero(datosPartida.Nombre, function(err, cartasTablero){
        if(err){
            console.log(err);
        }
        else{
            var cartas = JSON.parse(req.body.Cartas.toString());
            
            var tablero = new Array(7);
            for (var i = 0; i < 7; i++) {
              tablero[i] = new Array(7);
            }
            cartasTablero.forEach(function(p){
                // Ocultamos las casillas finales
                if(p.Valor === 21 || p.Valor === 22){
                    p.Valor = 23;
                }
                tablero[p.PosX][p.PosY] = p;
            });
                            
            // Mostarmos las casillas finales si la ha revelado
            // con la lupa
            cartas.forEach(function(p){
               if(p.Valor === 21 || p.Valor === 22){
                   tablero[p.PosX][p.PosY] = p;
               }
               if(p.Visitada !== undefined) p.Visitada = undefined;
            });
            
            
            logica.obtenerPosicionesPosibles(tablero, tablero[3][0], cartas[req.body.Inice]);
            
            if(cartas[req.body.Inice].Valor === 18) { 
                
                DAO.obtenerJugadoresHerramientaRota(datosPartida.Nombre, function(err, jugadores){
                    if(err)
                        console.log(err);
                    else{
                        response.status(200);
                        response.render("partidaCartaPico", { session: req.session, datosPartida: datosPartida, cartas: cartas, tablero: tablero, indCartaSeleccionada: req.body.Inice, jugadoresDisponibles: jugadores });
                        response.end();
                        
                    }
                });
                
            }else if(cartas[req.body.Inice].Valor === 19){
                DAO.obtenerJugadoresHerramientaActiva(datosPartida.Nombre, function(err, jugadores){
                    if(err)
                        console.log(err);
                    else
                        response.status(200);
                        response.render("partidaCartaPico", { session: req.session, datosPartida: datosPartida, cartas: cartas, tablero: tablero, indCartaSeleccionada: req.body.Inice, jugadoresDisponibles: jugadores });
                        response.end();
                });
            }else{   
                response.status(200);    
                response.render("partidaCartaSeleccionada", {session: req.session, datosPartida: datosPartida, cartas: cartas, tablero: tablero, indCartaSeleccionada: req.body.Inice});                
                response.end();
            }            
        }
    });
    
});

app.post("/procesar_insertar_carta", function(req, response){
    var carta = JSON.parse(req.body.Carta.toString());
    carta.PosX = parseInt(req.body.PosX);
    carta.PosY = parseInt(req.body.PosY);    
    var datosPartida = JSON.parse(req.body.DatosPartida.toString());
    
    partida.insertarCartaTablero(carta, datosPartida, req.session.nick, function(err){
        if(err){
           console.log(err);
        }
        else{
            response.status(300);
            response.redirect("/partida.html?Nombre=" + datosPartida.Nombre);                
            response.end();
        }
    });   
});

app.post("/procesar_desechar_carta", function(req, response){  
    var carta = JSON.parse(req.body.carta.toString());
    DAO.descartarCartaYAsignar(carta, req.session.nick, function(err){
        if(err){
            console.log(err);
        }
        else{            
            var datosPartida = JSON.parse(req.body.DatosPartida.toString());
            partida.pasarTurno(datosPartida, req.session.nick, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    response.status(300);
                    response.redirect("/partida.html?Nombre=" + datosPartida.Nombre);                
                    response.end();
                }
            });  
        }
    });
});

app.post("/procesar_bomba", function(req, response){  
    var cartaBomba = JSON.parse(req.body.CartaBomba.toString());
    var carta = JSON.parse(req.body.Carta.toString());
    DAO.descartarCarta(cartaBomba, function(err){
        if(err){
            console.log(err);
        }
        else{
            DAO.descartarCartaYAsignar(carta, req.session.nick, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    var datosPartida = JSON.parse(req.body.DatosPartida.toString());
                    partida.pasarTurno(datosPartida, req.session.nick, function(err){
                        if(err){
                            console.log(err);
                        }
                        else{
                            response.status(300);
                            response.redirect("/partida.html?Nombre=" + datosPartida.Nombre);                
                            response.end();
                        }
                    });    
                }
            });
        }        
    });
});

app.post("/procesar_lupa", function(req, response){  
    var cartaLupa = JSON.parse(req.body.CartaLupa.toString());
    var carta = JSON.parse(req.body.Carta.toString());
    DAO.obtenerCartaTablero(cartaLupa, function(err, cartaTablero){
        if(err){
            console.log(err);
        }
        else{
            DAO.desvelarCarta(cartaTablero, req.session.nick, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    DAO.descartarCartaYAsignar(carta, req.session.nick, function(err){
                        if(err){
                            console.log(err);
                        }
                        else{
                            var datosPartida = JSON.parse(req.body.DatosPartida.toString());
                            partida.pasarTurno(datosPartida, req.session.nick, function(err){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    response.status(300);
                                    response.redirect("/partida.html?Nombre=" + datosPartida.Nombre);                
                                    response.end();
                                }
                            });     
                        }
                    });
                    
                }        
            });
        }
    });    
});

app.post("/procesar_romper_pico", function(req, response){  
    var nickObjetivo = req.body.Nick;
    var carta = JSON.parse(req.body.Carta.toString());
    DAO.descartarCartaYAsignar(carta, req.session.nick, function(err){
        if(err){
            console.log(err);
        }
        else{
            var datosPartida = JSON.parse(req.body.DatosPartida.toString());
            DAO.rompeHerramienta(nickObjetivo, datosPartida.Nombre, function(err){            
                if(err){
                    console.log(err);
                }
                else{                
                    partida.pasarTurno(datosPartida, req.session.nick, function(err){
                        if(err){
                            console.log(err);
                        }
                        else{
                            response.status(300);
                            response.redirect("/partida.html?Nombre=" + datosPartida.Nombre);                
                            response.end();
                        }
                    });     
                }
            });  
        }
    });
});

app.post("/procesar_arreglar_pico", function(req, response){  
    var nickObjetivo = req.body.Nick;
    var carta = JSON.parse(req.body.Carta.toString());
    DAO.descartarCartaYAsignar(carta, req.session.nick, function(err){
        if(err){
            console.log(err);
        }
        else{
            var datosPartida = JSON.parse(req.body.DatosPartida.toString());
            DAO.arreglaHerramienta(nickObjetivo, datosPartida.Nombre, function(err){            
                if(err){
                    console.log(err);
                }
                else{                
                    partida.pasarTurno(datosPartida, req.session.nick, function(err){
                        if(err){
                            console.log(err);
                        }
                        else{
                            response.status(300);
                            response.redirect("/partida.html?Nombre=" + datosPartida.Nombre);                
                            response.end();
                        }
                    });     
                }
            });  
        }
    });
});

app.get("/imagen/usuario/:nick", function(request, response, next) {
   var n = String(request.params.nick);
   
    DAO.obtenerImagenUsuario(n, function(err, imagen) {
        if(err) {
            next(err);
        } else {
            if(imagen) {
                response.end(imagen);
            }
            else{
                var urlAvatar;
                if(request.session.sexo === "hombre"){
                    urlAvatar = path.join("img", "avatarDefaultMan.png");
                }
                else{
                    urlAvatar = path.join("img", "avatarDefaultWoman.png");
                }
                var fichDestino = path.join("public", urlAvatar);
                fs.createReadStream(fichDestino).pipe(response);
            }                
        }
     });
});

app.get("/imagen/carta/:id", function(request, response, next) {
   var n = parseInt(request.params.id);
   var pathCarta = "";
   var found = true;
   if(n > 0 && n <= 15){
       pathCarta = "T" + n;
   }
   else{
       switch(n){
            case 16:
                pathCarta = "Bomba";
                break;
            case 17:
                pathCarta = "Lupa";
               break;
            case 18:
                pathCarta = "PicoArreglado";
               break;
            case 19:
                pathCarta = "PicoRoto";
               break;
            case 20:
                pathCarta = "Start";
               break;
            case 21:
                pathCarta = "NoGold";
               break;
            case 22:
                pathCarta = "Gold";
               break;
            case 23:
                pathCarta = "DNK";
                break;
            default:
                found = false;
                break;
       }
    }
    if(found){
        pathCarta += ".png";
        var url = path.join("img", pathCarta);
        var fichDestino = path.join("public", url);
        fs.createReadStream(fichDestino).pipe(response);
    } else {
        response.status(404);
        response.end();
    }
    
});

app.post("/procesar_insertar_comentario", function(req, res){
    var datosComentario = {};
    var datosPartida = JSON.parse(req.body.DatosPartida.toString());
    var cartas = JSON.parse(req.body.Cartas.toString());
    var tablero = JSON.parse(req.body.Tablero.toString());
    
    datosComentario.nombrePartida = datosPartida.Nombre;
    datosComentario.texto = req.body.TextoComentario;
    datosComentario.nick = req.session.nick;
    
    req.checkBody("TextoComentario", "No se puede enviar un comentario sin texto.").notEmpty();
    
    req.getValidationResult().then(function(result) {
        if (result.isEmpty()) {
            DAO.insertaComentario(datosComentario, function(err){
                if(err)
                    console.log(err);
                else{
                    res.status(300);
                    res.redirect("/partida.html?Nombre=" + datosPartida.Nombre);                
                    res.end();
                }
            });
        }
        else{
            DAO.obtenerComentariosPartida(datosPartida.Nombre, function(err, comentarios){
                if(err)
                    console.log(err);
                else{
                    res.status(200);
                    res.render("partida", {errores: result.array(), session: req.session, datosPartida: datosPartida, cartas: cartas, tablero: tablero, comentarios: comentarios});                
                    res.end();
                }
            });
        }
    });
});


app.listen(config.port, function() {
    console.log("Servidor arrancado en el puerto " + config.port);
});
