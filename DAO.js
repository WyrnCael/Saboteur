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
                  " GROUP BY partidas.Nombre";
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

function obtenerPartidasAbiertas(callback){
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
                  " HAVING partidas.MaxJugadores > NumJugadores";
        con.query(sql,
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

function obtenerJugadoresPartida(nombrePartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = " SELECT jugadoresenpartida.Nick " +
                  " FROM jugadoresenpartida" +
                  " WHERE jugadoresenpartida.Nombre = ? ";
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

function iniciarPartida(datosPartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "UPDATE Partidas SET Estado=?, TrunoDe=?, MaxJugadores=?, TrunosRestantes=?)" + 
                       "WHERE Nombre=?";
        con.query(sql, [datosPartida.estado, datosPartida.turnoDe, 
                        datosPartida.maxJugadores, datosPartida.turnos, datosPartida.nombre], 
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

function asignarCarta(datosCarta, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "INSERT INTO Cartas(Nick, NombrePartida, PosX, PosY, Valor)" + 
                       "VALUES (?, ?, ?, ?, ?)";
        con.query(sql, [datosCarta.nick, datosCarta.nombrePartida, 
                        datosCarta.posX, datosCarta.posY, obtenerCartaAleatoria()], 
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
                       "WHERE Nombre=? AND Nick=?";
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
        var sql = "DELETE FROM Cartas WHERE Nick=? AND Nombre=? AND PosX=-1 AND PosY=-1" + 
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

function obtenerCartaAleatoria(){
    var randomCard = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
    return randomCard;
}

module.exports = {
    altaUsuario: altaUsuario,
    login: login,
    obtenerImagenUsuario: obtenerImagenUsuario,
    crearPartida: crearPartida,
    obtenerPartidasCreadasPor: obtenerPartidasCreadasPor,
    obtenerPartidasAbiertas: obtenerPartidasAbiertas,
    insertJugadorEnPartida: insertJugadorEnPartida,
    obtenerJugadoresPartida: obtenerJugadoresPartida,
    iniciarPartida: iniciarPartida,
    asignarCarta: asignarCarta,
    asignarRolJugador: asignarRolJugador,
    descartarCarta: descartarCarta
}
