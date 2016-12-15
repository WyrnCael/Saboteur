/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var mysql = require("mysql");
var config = require('./config.js');

var pool = mysql.createPool({
    host:  config.dbHost, 
    user:  config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});

function altaUsuario(datosUsuario, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        con.query("INSERT INTO Usuarios(Nick, Contraseña, Nombre, Sexo, Imagen, Nacimiento)" + 
                       " VALUES (?, ?, ?, ?, ?, ?)", [datosUsuario.usuario, datosUsuario.contraseña,
                        datosUsuario.nombre, datosUsuario.sexo, datosUsuario.foto, datosUsuario.nacimiento],
            function(err, rows) { 
                con.release();
                if (err) {
                    callback(err);
                } else {
                   callback(null);
                }                
            });
        }
    });
}

function login(datosLogin, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT * FROM Usuarios WHERE Nick = ? AND Contraseña = ?";
        con.query(sql, [datosLogin.user, datosLogin.password],
            function(err, rows) { 
                con.release();
                if (err) {
                    callback(err, null);
                } else {
                    var row = rows[0];        
                   callback(null, row);
                }                
            });
        }
    });
}

function obtenerImagenUsuario(id, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT Imagen FROM Usuarios WHERE Nick = ?";
        con.query(sql, [id], function(err, result) { 
                con.release();
                if (err) {
                    callback(err);
                } else {
                   if(result.length === 0){
                       callback(null, undefined);
                   } else {
                       callback(null, result[0].Imagen);
                   }
                }                
            });
        }
    });
}

function crearPartida(datosPartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        con.query("INSERT INTO Partidas(Nombre, NickCreador, FechaCreacion, Estado, MaxJugadores)" + 
                       " VALUES (?, ?, NOW(), ?, ?)", [datosPartida.nombre, datosPartida.creador, 0, datosPartida.maxJugadores],
            function(err, rows) { 
                con.release();
                if (err) {
                    callback(err);
                } else {
                   insertJugadorEnPartida(datosPartida.creador, datosPartida.nombre, function(err){
                       if(err){
                           callback(err);
                       }
                       else{
                           callback(null);
                       }
                   });                   
                }                
            });
        }
    });
}

function obtenerPartida(nombre, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        con.query("SELECT * FROM Partidas WHERE Nombre=?", [nombre],
            function(err, rows) { 
                con.release();
                if (err) {
                    callback(err);
                } else {  
                    obtenerJugadoresPartidas(rows, callback);
                }                
            });
        }
    });
}

function finalizarPartida(datosPartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        con.query("UPDATE Partidas SET Estado=2, Ganador=? WHERE Nombre=?",
                [datosPartida.Ganador, datosPartida.Nombre],
            function(err, rows) { 
                con.release();
                if (err) {
                    callback(err);
                } else {
                   callback(null);      
                }                
            });
        }
    });
}

function insertJugadorEnPartida(NickJugador, NickPartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        con.query("INSERT INTO JugadoresEnPartida(Nick, Nombre, Herramienta)" + 
                       " VALUES (?, ?, TRUE)", [NickJugador, NickPartida],
            function(err, rows) { 
                con.release();
                if (err) {
                    callback(err);
                } else {
                   callback(null);
                }                
            });
        }
    });
}

function obtenerPartidasCreadasPor(nombreUsuario, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT Partidas.Nombre, Partidas.NickCreador, Partidas.MaxJugadores, FechaCreacion, COUNT(*) AS NumJugadores" +
                  " FROM Partidas" + 
                  " INNER JOIN jugadoresenpartida" +
                          " ON partidas.Nombre = jugadoresenpartida.Nombre" + 
                          " AND partidas.NickCreador = ?" +
                  " GROUP BY partidas.Nombre" +
                  " HAVING partidas.MaxJugadores > NumJugadores";
          con.query(sql, [nombreUsuario],
            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else {                      
                    callback(null, rows);
                }
            });
        }
    });
}

function obtenerPartidasActivas(nickJugador, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT * FROM Partidas" + 
                    " INNER JOIN jugadoresenpartida" +
                    " ON partidas.Nombre = jugadoresenpartida.Nombre" +
                    " HAVING jugadoresenpartida.Nick = ? AND partidas.Estado = 1";
        con.query(sql, [nickJugador], 
            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else {  
                    callback(null, rows);
                }
            });
        }
    });    
}

function obtenerPartidasTerminadas(nickJugador, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT * FROM Partidas" + 
                    " INNER JOIN jugadoresenpartida" +
                    " ON partidas.Nombre = jugadoresenpartida.Nombre" +
                    " HAVING jugadoresenpartida.Nick = ? AND partidas.Estado=2";
        con.query(sql, [nickJugador], 
            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else {  
                    callback(null, rows);
                }
            });
        }
    });    
}

function obtenerPartidasAbiertas(nickJugador, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT Partidas.Nombre, Partidas.NickCreador," +
                        " Partidas.MaxJugadores, FechaCreacion, COUNT(*) AS NumJugadores" +
                  " FROM Partidas" +
                  " INNER JOIN jugadoresenpartida" +
                          " ON partidas.Nombre = jugadoresenpartida.Nombre" +
                  " GROUP BY partidas.Nombre" +
                  " HAVING partidas.MaxJugadores > NumJugadores AND Partidas.NickCreador != ?";
        con.query(sql, [nickJugador], 
            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else {  
                    obtenerJugadoresPartidas(rows, callback);
                }
            });
        }
    });    
}

function obtenerJugadoresPartidas(partidas, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        if(partidas.length === 0){
            con.release();
            callback(null, partidas);
        }
        else{
            partidas.forEach(function(p, index, array){
                var sql = " SELECT * " +
                      " FROM jugadoresenpartida" +
                      " WHERE jugadoresenpartida.Nombre = ? ";
                con.query(sql, [p.Nombre],
                    function(err, rows) {
                        if (err) {
                            con.release();
                            callback(err);
                        } else {  
                            partidas[partidas.indexOf(p)].Jugadores = rows;
                            if(index === array.length - 1){
                                con.release();
                                callback(null, partidas);
                            }
                        }
                });
            });    
        }            
    }
    });
}

function obtenerSaboteadores(nombrePartida, callback){
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = " SELECT * " +
                          " FROM jugadoresenpartida" +
                          " WHERE jugadoresenpartida.Nombre = ? AND TipoJugador=1";
            con.query(sql, [nombrePartida],
                function(err, rows) {
                    con.release();
                    if (err) {                            
                        callback(err);
                    } else {  
                        callback(null, rows);
                    }
            });

        }
    });
}

function iniciaPartida(partidas, callback){
    // Obtenemos la lista de jugadores
    obtenerJugadoresPartidas(partidas, function(err, datosPartida){
        if(err){
            callback(err);  
        }
        else{
            var partida = datosPartida[0];    
            // Iniciamos la partidas poniendo los valores por defecto y generando
            // los valores aleatorios:
            partida.Estado = 1; // Partida iniciada
            // Generamos un turno aleatorio:
            var randomTurn = Math.floor(Math.random() * (partida.Jugadores.length - 1 + 1));
            partida.TurnoDe = partida.Jugadores[randomTurn].Nick;
            partida.MaxJugadores = partida.Jugadores.length; // Jugadores actuales
            switch(partida.MaxJugadores){ // Numero de turnos.
                case 3:
                    partida.TurnosRestantes = 50;
                    break;
                case 4:
                    partida.TurnosRestantes = 45;
                    break;
                case 5:                    
                case 6:
                    partida.TurnosRestantes = 40;
                    break;
                case 7:
                    partida.TurnosRestantes = 35;
                    break;
            }
            actualizarDatosPartida(partida, function(err, datosPartida){
                if(err){
                    callback(err);  
                }
                else{
                    // Carta inicial
                    var datosCarta = {};
                    datosCarta.nombrePartida = partida.Nombre;
                    datosCarta.posX = 3;
                    datosCarta.posY = 0;
                    datosCarta.valor = 20;
                    asignarCartaSinJugador(datosCarta, function(err, datosPartida){
                        if(err){
                            callback(err);  
                        }
                        else{
                            // Cartas en destino
                             var destinos = [{}, {}, {}];                             
                             destinos[0].nombrePartida = partida.Nombre;
                             destinos[0].posX = 1;
                             destinos[0].posY = 6;
                             destinos[0].valor = 21;
                             destinos[1].nombrePartida = partida.Nombre;
                             destinos[1].posX = 3;
                             destinos[1].posY = 6;
                             destinos[1].valor = 21;
                             destinos[2].nombrePartida = partida.Nombre;
                             destinos[2].posX = 5;
                             destinos[2].posY = 6;
                             destinos[2].valor = 21;
                             var randomDestino = Math.floor(Math.random() * (3 - 1 + 1));
                             destinos[randomDestino].valor = 22;
                             var destinosFinales = destinos.slice(0);
                             asignarCartaSinJugador(destinos[randomDestino], function(err){
                                if(err){
                                    callback(err);
                                } 
                                else{
                                    destinos.splice(randomDestino, 1);
                                    destinos.forEach(function(p, indexDest, arrayDest){
                                         asignarCartaSinJugador(p, function(err){
                                            if(err){
                                                callback(err);
                                            } 
                                            else{                                                
                                                if(indexDest === arrayDest.length - 1){
                                                    // Generar cartas para jugadores
                                                    partida.Jugadores.forEach(function(p, indexJug, arrayJug){
                                                        var datosCartaJ = {};
                                                        datosCartaJ.nombrePartida = partida.Nombre;
                                                        datosCartaJ.nick = p.Nick;
                                                        datosCartaJ.posX = -1;
                                                        datosCartaJ.posY = -1;
                                                        datosCartaJ.NumCartas = 6;
                                                        asignarCartaJugador(datosCartaJ, function(err){                                                                
                                                            if(err){
                                                                callback(err);
                                                            }
                                                            else{
                                                                asignarCartasFinalesJugador(p, destinosFinales, function(err){
                                                                    if(err){
                                                                        callback(err);
                                                                    }
                                                                    else {
                                                                        if(indexJug === arrayJug.length - 1){
                                                                            if(partida.Jugadores.length <= 4) partida.NumSaboteadores = 1;
                                                                            else partida.NumSaboteadores = 2;
                                                                            asignarSaboteadoresJugadores(partida, function(err){          
                                                                                if(err){
                                                                                    callback(err);
                                                                                }
                                                                                else{   
                                                                                    partida.Jugadores.forEach(function(p, indexJ, arrayJ){
                                                                                        var datosRol = { tipo: 0, nombre: partida.Nombre, nick: p.Nick};
                                                                                        asignarRolJugador(datosRol, function(err){
                                                                                            if(err){
                                                                                                callback(err);
                                                                                            }
                                                                                            else{
                                                                                                if(indexJ === arrayJ.length - 1){
                                                                                                    callback(null);
                                                                                                }
                                                                                            }
                                                                                       });
                                                                                    });

                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });                                                                
                                                            }
                                                        });
                                                        
                                                    });                                                    
                                                    
                                                }
                                            }
                                        });
                                    });
                                }
                             });
                        }
                    });
                }
            });          
        }
    });
}

function actualizarDatosPartida(datosPartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "UPDATE Partidas SET Estado=?, TurnoDe=?, MaxJugadores=?, TurnosRestantes=?" + 
                   " WHERE Nombre=?";
        con.query(sql, [datosPartida.Estado, datosPartida.TurnoDe, 
                        datosPartida.MaxJugadores, datosPartida.TurnosRestantes, datosPartida.Nombre], 
            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else {                      
                    callback(null, rows);
                }
            });
        }
    });
}

function asignarCartasFinalesJugador(jugador, destinos, callback){
    destinos.forEach(function(d, index, array) {
        pool.getConnection(function(err, con) {
            if (err) {
                callback(err);
            } else {
                var sql = "INSERT INTO Cartas(Nick, NombrePartida, PosX, PosY, Valor)" + 
                               " VALUES (?, ?, ?, ?, ?)";
                con.query(sql, [jugador.Nick, d.nombrePartida, 
                                d.posX, d.posY, 23], 
                                function(err, rows) {   
                    con.release();
                    if (err) {
                        callback(err);
                    } else { 
                        if(index === array.length - 1){
                            callback(null, rows);
                        }
                    }
                });
            }
        });
    });    
}

function desbloquearCartaFinalesJugador(jugador, cartaFinal, callback){
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "UPDATE Cartas SET Valor=? WHERE Nick =? AND NombrePartida=?" + 
                           "  AND PosX=? AND PosY=?";
            con.query(sql, [cartaFinal.valor, jugador.Nick, cartaFinal.nombrePartida, 
                            cartaFinal.posX, cartaFinal.posY], 
                            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else { 
                    callback(null, rows);
                }
            });
        }
    });    
}

function asignarCartaJugador(datosCarta, callback){
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            if(datosCarta.valor === undefined){
                datosCarta.valor = obtenerCartaAleatoria();
            }
            var sql = "INSERT INTO Cartas(Nick, NombrePartida, PosX, PosY, Valor)" + 
                           " VALUES (?, ?, ?, ?, ?)";
            con.query(sql, [datosCarta.nick, datosCarta.nombrePartida, 
                            datosCarta.posX, datosCarta.posY, datosCarta.valor], 
                            function(err, rows) {   
                con.release();
                
                if (err) {
                    callback(err);
                } else { 
                    if(datosCarta.NumCartas === undefined){
                        callback(null, rows);
                    }
                    else{
                        if(datosCarta.NumCartas > 1){
                            datosCarta.NumCartas--;
                            datosCarta.valor = undefined;
                            asignarCartaJugador(datosCarta, callback);
                        }
                        else{
                            callback(null, rows);
                        }
                    }
                }
            });
        }
    });
}

function asignarCartaSinJugador(datosCarta, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        if(datosCarta.valor === undefined){
            datosCarta.valor = obtenerCartaAleatoria();
        }
        var sql = "INSERT INTO Cartas(NombrePartida, PosX, PosY, Valor)" + 
                       " VALUES (?, ?, ?, ?)";
        con.query(sql, [datosCarta.nombrePartida, 
                        datosCarta.posX, datosCarta.posY, datosCarta.valor], 
            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else {                      
                    callback(null, rows);
                }
            });
        }
    });
}

function insertarCartaTablero(datosCarta, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "UPDATE Cartas SET PosX=?, PosY=?" + 
                       " WHERE Id=?";
        con.query(sql, [datosCarta.PosX, datosCarta.PosY, datosCarta.Id], 
            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else {                      
                    callback(null, rows);
                }
            });
        }
    });
}

function asignarRolJugador(datosRol, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "UPDATE JugadoresEnPartida SET TipoJugador=?" + 
                       " WHERE Nombre=? AND Nick=?";
        con.query(sql, [datosRol.tipo, datosRol.nombre, datosRol.nick], 
            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else {                      
                    callback(null, rows);
                }
            });
        }
    });
}

function asignarSaboteadoresJugadores(partida, callback){
    var randomJugador = Math.floor(Math.random() * (partida.Jugadores.length - 1 + 1));
    var datosRol = { tipo: 1, nombre: partida.Nombre, nick: partida.Jugadores[randomJugador].Nick};
                                                                        
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "UPDATE JugadoresEnPartida SET TipoJugador=?" + 
                       " WHERE Nombre=? AND Nick=?";
        con.query(sql, [datosRol.tipo, datosRol.nombre, datosRol.nick], 
            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else {  
                    partida.Jugadores.splice(randomJugador, 1);                                                                             
                    if(partida.NumSaboteadores > 1){
                        partida.NumSaboteadores--;
                        asignarSaboteadoresJugadores(partida, callback);
                    }
                    else{
                        callback(null, rows);
                    }                    
                }
            });
        }
    });
}

function descartarCarta(carta, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "DELETE FROM Cartas WHERE Nick=? AND NombrePartida=? AND PosX=? AND PosY=?" + 
                       " AND Valor=?";
        con.query(sql, [carta.Nick, carta.NombrePartida, 
                        carta.PosX, carta.PosY, carta.Valor], 
            function(err, rows) { 
                con.release();
                if (err) {                    
                    callback(err);
                } else {            
                    callback(null);
                }
            });
        }
       
    });
}

function descartarCartaYAsignar(carta, nick, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "DELETE FROM Cartas WHERE Nick=? AND NombrePartida=? AND PosX=? AND PosY=?" + 
                       " AND Valor=?";
        con.query(sql, [carta.Nick, carta.NombrePartida, 
                        carta.PosX, carta.PosY, carta.Valor], 
            function(err, rows) { 
                con.release();
                if (err) {                    
                    callback(err);
                } else {
                    var datosCartaJ = {};
                    datosCartaJ.nombrePartida = carta.NombrePartida;
                    datosCartaJ.nick = nick;
                    datosCartaJ.posX = -1;
                    datosCartaJ.posY = -1;
                    asignarCartaJugador(datosCartaJ, callback);
                }
            });
        }
       
    });
}

function desvelarCarta(carta, nick, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "UPDATE Cartas SET Valor=? WHERE Nick=? AND NombrePartida=? AND PosX=?" + 
                       " AND PosY=?";
        con.query(sql, [carta.Valor, nick, carta.NombrePartida, 
                        carta.PosX, carta.PosY], 
            function(err, rows) { 
                con.release();
                if (err) {                    
                    callback(err);
                } else {            
                    callback(null);
                }
            });
        }
       
    });
}

function obtenerCartasDisponiblesJugadorPartida(nick, nombrePartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT * FROM Cartas WHERE Nick=? AND NombrePartida=?";
        con.query(sql, [nick, nombrePartida], 
            function(err, rows) {  
                con.release();
                if (err) {
                    callback(err);
                } else {                      
                    callback(null, rows);
                }
            });
        }
    });
}

function obtenerCartasTablero(nombrePartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT * FROM Cartas WHERE NombrePartida=? AND PosX!=-1 AND PosY!=-1";
        con.query(sql, [nombrePartida], 
            function(err, rows) {  
                con.release();
                if (err) {
                    callback(err);
                } else {        
                    callback(null, rows);
                }
            });
        }
    });
}


function obtenerCartaTablero(carta, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT * FROM Cartas WHERE NombrePartida=?"+
                    " AND PosX=? AND PosY=? AND Nick IS NULL";
        con.query(sql, [carta.NombrePartida, 
                        carta.PosX, carta.PosY], 
            function(err, rows) {   
                con.release();
                if (err) {
                    callback(err);
                } else {   
                    callback(null, rows[0]);
                }
            });
        }
    });
}

function obtenerComentariosPartida(nombrePartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT * FROM Comentarios WHERE NombrePartida=? ";
        con.query(sql, [nombrePartida], 
            function(err, rows) {  
                con.release();
                if (err) {
                    callback(err);
                } else {                      
                    callback(null, rows);
                }
            });
        }
    });
}

function insertaComentario(datosComentario, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        con.query("INSERT INTO Comentarios(Fecha, Nick, NombrePartida, Texto)" + 
                       " VALUES (NOW(), ?, ?, ?)", [datosComentario.nick, datosComentario.nombrePartida, datosComentario.texto],
            function(err, rows) { 
                con.release();
                if (err) {
                    callback(err);
                } else {
                   callback(null);                   
                }                
            });
        }
    });
}

function obtenerCartaAleatoria(){
    var randomCard = Math.floor(Math.random() * (19 - 1 + 1)) + 1;
    return randomCard;
}

module.exports = {
    altaUsuario: altaUsuario,
    login: login,
    obtenerImagenUsuario: obtenerImagenUsuario,
    crearPartida: crearPartida,
    obtenerPartida: obtenerPartida,
    finalizarPartida: finalizarPartida,
    obtenerPartidasCreadasPor: obtenerPartidasCreadasPor,
    obtenerPartidasAbiertas: obtenerPartidasAbiertas,
    insertJugadorEnPartida: insertJugadorEnPartida,
    iniciaPartida: iniciaPartida,
    asignarCartaSinJugador: asignarCartaSinJugador,
    desbloquearCartaFinalesJugador: desbloquearCartaFinalesJugador,
    asignarCartaJugador: asignarCartaJugador,
    asignarRolJugador: asignarRolJugador,
    insertarCartaTablero: insertarCartaTablero,
    descartarCarta: descartarCarta,
    descartarCartaYAsignar: descartarCartaYAsignar,
    desvelarCarta: desvelarCarta,
    obtenerJugadoresPartidas: obtenerJugadoresPartidas,
    obtenerSaboteadores: obtenerSaboteadores,
    obtenerCartaTablero: obtenerCartaTablero,
    obtenerPartidasActivas: obtenerPartidasActivas,
    obtenerPartidasTerminadas: obtenerPartidasTerminadas,
    obtenerCartasDisponiblesJugadorPartida: obtenerCartasDisponiblesJugadorPartida,
    obtenerCartasTablero: obtenerCartasTablero,
    actualizarDatosPartida: actualizarDatosPartida,
    obtenerComentariosPartida: obtenerComentariosPartida,
    insertaComentario: insertaComentario
};
