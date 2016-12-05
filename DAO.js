/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var mysql = require("mysql");

var pool = mysql.createPool({
    host:  "localhost",
    user:  "root",
    password: "",
    database: "Saboteur"
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

module.exports = {
    altaUsuario: altaUsuario,
    login: login,
    obtenerImagenUsuario: obtenerImagenUsuario,
    crearPartida: crearPartida,
    obtenerPartidasCreadasPor: obtenerPartidasCreadasPor,
    obtenerPartidasAbiertas: obtenerPartidasAbiertas
}
