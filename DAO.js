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
                       "VALUES (?, ?, ?, ?, ?, ?)", [datosUsuario.usuario, datosUsuario.contraseña,
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
                       "VALUES (?, ?, NOW(), ?, ?)", [datosPartida.nombre, datosPartida.creador, 0, datosPartida.maxJugadores],
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

function insertJugadorEnPartida(NickJugador, NickPartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        con.query("INSERT INTO JugadoresEnPartida(Nick, Nombre, Herramienta)" + 
                       "VALUES (?, ?, TRUE)", [NickJugador, NickPartida],
            function(err) { 
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
                    " GROUP BY partidas.Nombre" +
                    " HAVING jugadoresenpartida.Nick = ? AND partidas.Estado = 2";
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
        var n = partidas.length;
        
        if(n === 0) callback(null, partidas);
        else{
            partidas.forEach(function(p){
                var sql = " SELECT jugadoresenpartida.Nick " +
                      " FROM jugadoresenpartida" +
                      " WHERE jugadoresenpartida.Nombre = ? ";
                con.query(sql, [p.Nombre],
                    function(err, rows) {
                        if (err) {
                            con.release();
                            callback(err);
                        } else {  
                            partidas[partidas.indexOf(p)].Jugadores = rows;
                            n--;                        
                            if(n === 0){
                                callback(null, partidas);
                            }
                        }
                });
            });    
        }            
    }
    });
}

function iniciaPartida(partidas, callback){
    // Obtenemos la lista de jugadores
    obtenerJugadoresPartidas(partidas, function(err, datosPartida){
        if(err){
            console.log(err);  
        }
        else{
            var partida = partidas[0];    
            // Iniciamos la partidas poniendo los valores por defecto y generando
            // los valores aleatorios:
            partida.estado = 1; // Partida iniciada
            // Generamos un turno aleatorio:
            var randomTurn = Math.floor(Math.random() * (partida.Jugadores.length - 1 + 1));
            partida.turnoDe = partida.Jugadores[randomTurn].Nick;
            partida.maxJugadores = partida.Jugadores.length; // Jugadores actuales
            switch(partida.maxJugadores){ // Numero de turnos.
                case 3:
                    partida.turnos = 50;
                    break;
                case 4:
                    partida.turnos = 45;
                    break;
                case 5:                    
                case 6:
                    partida.turnos = 40;
                    break;
                case 7:
                    partida.turnos = 35;
                    break;
            }
            iniciarDatosPartida(partida, function(err, datosPartida){
                if(err){
                    console.log(err);  
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
                            console.log(err);  
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
                             asignarCartaSinJugador(destinos[randomDestino], function(err){
                                if(err){
                                    console.log(err);
                                } 
                                else{
                                    destinos.splice(randomDestino, 1);
                                    var n = 2;
                                    destinos.forEach(function(p){
                                         asignarCartaSinJugador(p, function(err){
                                            if(err){
                                                console.log(err);
                                            } 
                                            else{                                                
                                                n--;
                                                if(n === 0){
                                                    // Generar cartas para jugadores
                                                    n = partida.Jugadores.length;
                                                    partida.Jugadores.forEach(function(p){
                                                    var j = 6;
                                                        for(var i = 0; i < 6; i++){
                                                            var datosCartaJ = {};
                                                            datosCartaJ.nombrePartida = partida.Nombre;
                                                            datosCartaJ.nick = p.Nick;
                                                            datosCartaJ.posX = -1;
                                                            datosCartaJ.posY = -1;
                                                            asignarCartaJugador(datosCartaJ, function(err){
                                                                if(err){
                                                                    console.log(err);
                                                                }
                                                                else{
                                                                    j--;
                                                                    if(j === 0){
                                                                        n--;
                                                                        if(n === 0){
                                                                            var randomJugador = Math.floor(Math.random() * (partida.Jugadores.length - 1 + 1));
                                                                            var datosRol = { tipo: 1, nombre: partida.Nombre, nick: partida.Jugadores[randomJugador].Nick};
                                                                            asignarRolJugador(datosRol, function(err){
                                                                                if(err){
                                                                                    console.log(err);
                                                                                }
                                                                                else{
                                                                                    partida.Jugadores.splice(randomJugador, 1);
                                                                                    var m = partida.Jugadores.length;
                                                                                    partida.Jugadores.forEach(function(p){
                                                                                       datosRol.nick = p.Nick;
                                                                                       datosRol.tipo = 0;
                                                                                       asignarRolJugador(datosRol, function(err){
                                                                                            if(err){
                                                                                                console.log(err);
                                                                                            }
                                                                                            else{
                                                                                                m--;
                                                                                                if(m === 0){
                                                                                                    callback(null);
                                                                                                }
                                                                                            }
                                                                                       });
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                        }
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

function iniciarDatosPartida(datosPartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "UPDATE Partidas SET Estado=?, TurnoDe=?, MaxJugadores=?, TurnosRestantes=?" + 
                   " WHERE Nombre=?";
        con.query(sql, [datosPartida.estado, datosPartida.turnoDe, 
                        datosPartida.maxJugadores, datosPartida.turnos, datosPartida.Nombre], 
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
                       "VALUES (?, ?, ?, ?, ?)";
        con.query(sql, [datosCarta.nick, datosCarta.nombrePartida, 
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

function asignarCartaSinJugador(datosCarta, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        if(datosCarta.valor === undefined){
            datosCarta.valor = obtenerCartaAleatoria();
        }
        var sql = "INSERT INTO Cartas(NombrePartida, PosX, PosY, Valor)" + 
                       "VALUES (?, ?, ?, ?)";
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

function descartarCarta(datosCarta, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "DELETE FROM Cartas WHERE Nick=? AND NombrePartida=? AND PosX=-1 AND PosY=-1" + 
                       "AND Valor=?";
        con.query(sql, [datosCarta.nick, datosCarta.nombrePartida, 
                        datosCarta.posX, datosCarta.posY, datosCarta.valor], 
            function(err, rows) {                   
                if (err) {
                    con.release();
                    callback(err);
                } else {            
                    asignarCarta(datosCarta, function(err, datos) {
                       if(err){
                           callback(err);
                       } 
                       else{
                           callback(null, datos);
                       }
                    });
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
        var sql = "SELECT * FROM Cartas WHERE Nick=? AND NombrePartida=? AND PosX=-1 AND PosY=-1";
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

function obtenerCartaAleatoria(){
    var randomCard = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
    return randomCard;
}

module.exports = {
    altaUsuario: altaUsuario,
    login: login,
    obtenerImagenUsuario: obtenerImagenUsuario,
    crearPartida: crearPartida,
    obtenerPartida: obtenerPartida,
    obtenerPartidasCreadasPor: obtenerPartidasCreadasPor,
    obtenerPartidasAbiertas: obtenerPartidasAbiertas,
    insertJugadorEnPartida: insertJugadorEnPartida,
    iniciaPartida: iniciaPartida,
    asignarCartaSinJugador: asignarCartaSinJugador,
    asignarCartaJugador: asignarCartaJugador,
    asignarRolJugador: asignarRolJugador,
    descartarCarta: descartarCarta,
    obtenerJugadoresPartidas: obtenerJugadoresPartidas,
    obtenerPartidasActivas: obtenerPartidasActivas,
    obtenerPartidasTerminadas: obtenerPartidasTerminadas,
    obtenerCartasDisponiblesJugadorPartida: obtenerCartasDisponiblesJugadorPartida,
    obtenerCartasTablero: obtenerCartasTablero
};
