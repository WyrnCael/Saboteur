"use strict";

var DAO = require('./DAO.js');
var logica = require('./logica.js');

function pasarTurno(datosPartida, nick, callback){
    datosPartida.Jugadores.forEach(function(p, ind, arr){
        if(p.Nick === nick){
            if(ind > arr.length - 2) datosPartida.TurnoDe = datosPartida.Jugadores[0].Nick;
            else datosPartida.TurnoDe = datosPartida.Jugadores[ind+1].Nick;
        }
        if(ind === arr.length - 1){
            datosPartida.TurnosRestantes = parseInt(datosPartida.TurnosRestantes) - 1;
            datosPartida.Estado = 1;
            DAO.actualizarDatosPartida(datosPartida, function(err){
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

function insertarCartaTablero(carta, datosPartida, nick, callback){
    DAO.insertarCartaTablero(carta, function(err){
        if(err){
            console.log(err);
        }
        else{
            pasarTurno(datosPartida, nick, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    var datosCartaJ = {};
                    datosCartaJ.nombrePartida = datosPartida.Nombre;
                    datosCartaJ.nick = nick;
                    datosCartaJ.posX = -1;
                    datosCartaJ.posY = -1;
                    DAO.asignarCartaJugador(datosCartaJ, function(err){
                        if(err){
                            console.log(err);
                        }
                        else{
                            DAO.obtenerCartasTablero(datosPartida.Nombre, function(err, cartasTablero){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    var tablero = new Array(7);
                                    for (var i = 0; i < 7; i++) {
                                      tablero[i] = new Array(7);
                                    }

                                    cartasTablero.forEach(function(p){
                                        if(p.Valor !== 23){
                                            tablero[p.PosX][p.PosY] = p;
                                        }
                                    });

                                    logica.comprobarFinalPartida(tablero, carta, datosPartida.Jugadores, function(err, final){
                                        if(err){
                                           console.log(err);
                                        } 
                                        else{
                                           DAO.obtenerCartasDisponiblesJugadorPartida(nick, datosPartida.Nombre, function(err, cartas){
                                               if(err){
                                                   console.log(err);
                                               } 
                                               else{
                                                   cartasTablero.forEach(function(p){
                                                        // Ocultamos las casillas finales
                                                        if(p.Valor === 21 || p.Valor === 22){
                                                            p.Valor = 23;
                                                        }
                                                    });

                                                    // Mostarmos las casillas finales si la ha revelado
                                                    // con la lupa o se ha llegado a ella
                                                    cartas.forEach(function(p){
                                                       if(p.Valor === 21 || p.Valor === 22){
                                                          tablero[p.PosX][p.PosY] = p;
                                                       } 
                                                    });

                                                    if(final){
                                                        var datosPartidaFin = {};
                                                        datosPartidaFin.Ganador = nick;
                                                        datosPartidaFin.Nombre = datosPartida.Nombre;
                                                        DAO.finalizarPartida(datosPartidaFin, function(err){
                                                           if(err){
                                                                console.log(err);
                                                           }
                                                           else{
                                                                callback(null);
                                                           }
                                                        });                                                         
                                                    }
                                                    else{
                                                        if (datosPartida.TurnosRestantes === 0){
                                                            DAO.obtenerSaboteadores(datosPartida.Nombre, function(err, saboteadores){
                                                                if(err){
                                                                    console.log(err);
                                                                }
                                                                else{
                                                                    var ganador = "";
                                                                    // Si habia dos saboteadores, ganan los dos.
                                                                    saboteadores.forEach(function(p){
                                                                        ganador += p.Nick;
                                                                    });
                                                                    var datosPartidaFin = {};
                                                                    datosPartidaFin.Ganador = ganador;
                                                                    datosPartidaFin.Nombre = datosPartida.Nombre;
                                                                    DAO.finalizarPartida(datosPartidaFin, function(err){
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
                                                        else{
                                                            callback(null);
                                                        }                                                        
                                                    }
                                                }                                               
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
    });
}

module.exports = {
    pasarTurno: pasarTurno,
    insertarCartaTablero: insertarCartaTablero
};