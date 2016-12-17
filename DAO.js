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
        var sql = "SELECT * FROM Usuarios WHERE Nick = ?";
        con.query(sql, [id], function(err, result) { 
                con.release();
                if (err) {
                    callback(err);
                } else {
                   callback(null, result[0]);
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
        con.query("UPDATE Partidas SET Estado=2 WHERE Nombre=?",
                [datosPartida.Nombre],
            function(err, rows) { 
                con.release();
                if (err) {
                    callback(err);
                } else {
                   marcarGanadores(datosPartida.Ganadores, datosPartida.Nombre, callback); 
                }                
            });
        }
    });
}

function marcarGanadores(nicks, nombrePartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        con.query("UPDATE JugadoresEnPartida SET Ganador=TRUE WHERE Nick=? AND Nombre=?",
                [nicks[0], nombrePartida],
            function(err, rows) { 
                con.release();
                if (err) {
                    callback(err);
                } else {
                    nicks.splice(0, 1);
                    if(nicks.length > 0){
                        marcarGanadores(nicks, nombrePartida, callback);
                    }
                    else{
                        callback(null);      
                    }                   
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
                    obtenerJugadoresPartidas(rows, callback);
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
                  " GROUP BY jugadoresenpartida.Nombre" +
                  " HAVING partidas.MaxJugadores > NumJugadores";
        con.query(sql, [], 
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
        var sql = "DELETE FROM Cartas WHERE Id=?";
        con.query(sql, [carta.Id], 
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
        var sql = "DELETE FROM Cartas WHERE Id=?";
        con.query(sql, [carta.Id], 
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

function obtenerJugadoresHerramientaActiva(nombrePartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "SELECT * FROM JugadoresEnPartida WHERE Nombre=? AND Herramienta=1";
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

function rompeHerramienta(nick, nombrePartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "UPDATE JugadoresEnPartida SET Herramienta=0 WHERE Nick=? AND Nombre=? ";
        
        con.query(sql, [ nick, nombrePartida], 
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

function obtenerJugadoresHerramientaRota(nombrePartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = " SELECT * FROM JugadoresEnPartida WHERE Nombre=? AND Herramienta=0 ";
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

function arreglaHerramienta(nick, nombrePartida, callback){
    pool.getConnection(function(err, con) {
    if (err) {
        callback(err);
    } else {
        var sql = "UPDATE JugadoresEnPartida SET Herramienta=1 WHERE Nick=? AND Nombre=? ";
        
        con.query(sql, [ nick, nombrePartida], 
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

module.exports = {
    altaUsuario: altaUsuario,
    login: login,
    obtenerImagenUsuario: obtenerImagenUsuario,
    crearPartida: crearPartida,
    obtenerPartida: obtenerPartida,
    finalizarPartida: finalizarPartida,
    obtenerPartidasAbiertas: obtenerPartidasAbiertas,
    insertJugadorEnPartida: insertJugadorEnPartida,
    asignarCartaSinJugador: asignarCartaSinJugador,
    asignarCartasFinalesJugador: asignarCartasFinalesJugador,
    desbloquearCartaFinalesJugador: desbloquearCartaFinalesJugador,
    asignarSaboteadoresJugadores: asignarSaboteadoresJugadores,
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
    insertaComentario: insertaComentario,
    rompeHerramienta: rompeHerramienta,
    arreglaHerramienta: arreglaHerramienta,
    obtenerJugadoresHerramientaActiva: obtenerJugadoresHerramientaActiva,
    obtenerJugadoresHerramientaRota: obtenerJugadoresHerramientaRota    
};
