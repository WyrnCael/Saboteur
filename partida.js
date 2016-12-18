/* 
 * GRUPO 111 - Rubén Casado y Juan José Prieto
 */
"use strict";

var DAO = require('./DAO.js');
var logica = require('./logica.js');

function iniciaPartida(partidas, callback){
    // Obtenemos la lista de jugadores
    DAO.obtenerJugadoresPartidas(partidas, function(err, datosPartida){
        if(err){
            callback(err);  
        }
        else{
            var partida = datosPartida[0];    
            // Iniciamos la partida poniendo los valores por defecto y generando
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
            DAO.actualizarDatosPartida(partida, function(err, datosPartida){
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
                    DAO.asignarCartaSinJugador(datosCarta, function(err, datosPartida){
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
                             DAO.asignarCartaSinJugador(destinos[randomDestino], function(err){
                                if(err){
                                    callback(err);
                                } 
                                else{
                                    destinos.splice(randomDestino, 1);
                                    destinos.forEach(function(p, indexDest, arrayDest){
                                        DAO.asignarCartaSinJugador(p, function(err){
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
                                                        DAO.asignarCartaJugador(datosCartaJ, function(err){                                                                
                                                            if(err){
                                                                callback(err);
                                                            }
                                                            else{
                                                                if(indexJug === arrayJug.length - 1){
                                                                    partida.Jugadores.forEach(function(p, indexJu, arrayJu){
                                                                        DAO.asignarCartasFinalesJugador(p, destinosFinales, function(err){
                                                                            if(err){
                                                                                callback(err);
                                                                            }
                                                                            else {
                                                                                if(indexJu === arrayJu.length - 1){
                                                                                    if(partida.Jugadores.length <= 4) partida.NumSaboteadores = 1;
                                                                                    else partida.NumSaboteadores = 2;
                                                                                    DAO.asignarSaboteadoresJugadores(partida, function(err){          
                                                                                        if(err){
                                                                                            callback(err);
                                                                                        }
                                                                                        else{   
                                                                                            partida.Jugadores.forEach(function(p, indexJ, arrayJ){
                                                                                                var datosRol = { tipo: 0, nombre: partida.Nombre, nick: p.Nick};
                                                                                                DAO.asignarRolJugador(datosRol, function(err){
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
                                                                    });                                                                    
                                                                }
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
                    if (datosPartida.TurnosRestantes <= 0){
                        DAO.obtenerSaboteadores(datosPartida.Nombre, function(err, saboteadores){
                            if(err){
                                callback(err);
                            }
                            else{
                                var ganadores = [];
                                // Si habia dos saboteadores, ganan los dos.
                                saboteadores.forEach(function(p, indexSabo, araySabo){
                                    ganadores[indexSabo] = p.Nick;
                                });
                                var datosPartidaFin = {};
                                datosPartidaFin.Ganadores = ganadores;
                                datosPartidaFin.Nombre = datosPartida.Nombre;
                                DAO.finalizarPartida(datosPartidaFin, function(err){
                                   if(err){
                                        callback(err);
                                   }
                                   else{
                                        callback(null, true);
                                   }
                                });    
                            }   
                        });
                    }
                    else{
                        callback(null, false);
                    }
                }
            });     
        }
    });          
}

function insertarCartaTablero(carta, datosPartida, nick, callback){
    DAO.insertarCartaTablero(carta, function(err){
        if(err){
            callback(err);
        }
        else{
            pasarTurno(datosPartida, nick, function(err){
                if(err){
                    callback(err);
                }
                else{
                    var datosCartaJ = {};
                    datosCartaJ.nombrePartida = datosPartida.Nombre;
                    datosCartaJ.nick = nick;
                    datosCartaJ.posX = -1;
                    datosCartaJ.posY = -1;
                    DAO.asignarCartaJugador(datosCartaJ, function(err){
                        if(err){
                            callback(err);
                        }
                        else{
                            DAO.obtenerCartasTablero(datosPartida.Nombre, function(err, cartasTablero){
                                if(err){
                                    callback(err);
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
                                           callback(err);
                                        } 
                                        else{
                                           DAO.obtenerCartasDisponiblesJugadorPartida(nick, datosPartida.Nombre, function(err, cartas){
                                               if(err){
                                                   callback(err);
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
                                                        datosPartidaFin.Ganadores = [nick];
                                                        datosPartidaFin.Nombre = datosPartida.Nombre;
                                                        DAO.finalizarPartida(datosPartidaFin, function(err){
                                                           if(err){
                                                                callback(err);
                                                           }
                                                           else{
                                                                callback(null, true);
                                                           }
                                                        });                                                         
                                                    }
                                                    else{
                                                        if (datosPartida.TurnosRestantes === 0){
                                                            DAO.obtenerSaboteadores(datosPartida.Nombre, function(err, saboteadores){
                                                                if(err){
                                                                    callback(err);
                                                                }
                                                                else{
                                                                    var ganadores = [];
                                                                    // Si habia dos saboteadores, ganan los dos.
                                                                    saboteadores.forEach(function(p, indexSabo, araySabo){
                                                                        ganadores[indexSabo] = p.Nick;
                                                                    });
                                                                    var datosPartidaFin = {};
                                                                    datosPartidaFin.Ganadores = ganadores;
                                                                    datosPartidaFin.Nombre = datosPartida.Nombre;
                                                                    DAO.finalizarPartida(datosPartidaFin, function(err){
                                                                       if(err){
                                                                            callback(err);
                                                                       }
                                                                       else{
                                                                            callback(null, true);
                                                                       }
                                                                    });    
                                                                }   
                                                            });
                                                        }
                                                        else{
                                                            callback(null, false);
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
    insertarCartaTablero: insertarCartaTablero,
    iniciaPartida: iniciaPartida
};