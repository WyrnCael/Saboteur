/* 
 * GRUPO 111 - Rubén Casado y Juan José Prieto
 */
"use strict";

var DAO = require('./DAO.js');

function obtenerPosicionesPosibles(tablero, cartaActual, cartaInsertar){
    if(cartaActual !== -1){
        var x = cartaActual.PosX;
        var y = cartaActual.PosY;
        if(tablero[x][y].Visitada === undefined || !cartaActual.Visitada ){ 
            tablero[x][y].Visitada = true;
            if(x > 0){
                if(tablero[x-1][y] === undefined || tablero[x-1][y] === -1){
                    if(esPosible(cartaInsertar, cartaActual, 1)){
                        if (compruebaDisponiblidadTotal(tablero, cartaInsertar, x-1, y)) tablero[x-1][y] = -1;
                    }
                } else{
                    if(esPosible(tablero[x-1][y], cartaActual, 1)){
                        obtenerPosicionesPosibles(tablero, tablero[x-1][y], cartaInsertar);
                    }                    
                }
            }
            if(y > 0){
                if(tablero[x][y-1] === undefined || tablero[x][y-1] === -1){
                    if(esPosible(cartaInsertar, cartaActual, 4)){
                        if (compruebaDisponiblidadTotal(tablero, cartaInsertar, x, y-1)) tablero[x][y-1] = -1;
                    }
                } else{
                    if(esPosible(tablero[x][y-1], cartaActual, 4)){
                        obtenerPosicionesPosibles(tablero, tablero[x][y-1], cartaInsertar);
                    }
                }
            }
            if(x < 6){
                if(tablero[x+1][y] === undefined || tablero[x+1][y] === -1){
                    if(esPosible(cartaInsertar, cartaActual, 3)){
                        if (compruebaDisponiblidadTotal(tablero, cartaInsertar, x+1, y)) tablero[x+1][y] = -1;
                    }
                } else{
                    if(esPosible(tablero[x+1][y], cartaActual, 3)){
                        obtenerPosicionesPosibles(tablero, tablero[x+1][y], cartaInsertar);
                    }
                }
            }
            if(y < 6){
                if(tablero[x][y+1] === undefined || tablero[x][y+1] === -1){
                    if(esPosible(cartaInsertar, cartaActual, 2)){
                        if (compruebaDisponiblidadTotal(tablero, cartaInsertar, x, y+1)) tablero[x][y+1] = -1;
                    }
                } else{
                    if(esPosible(tablero[x][y+1], cartaActual, 2)){
                        obtenerPosicionesPosibles(tablero, tablero[x][y+1], cartaInsertar);
                    }
                }
            }        
        }
    }   
}

function esPosible(carta1, carta2, posicion){
    var compatibilidad = [ {},
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: []}, // 1
                        { sur: [], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 2
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 3
                        { sur: [], este: []}, // 4
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: []}, // 5
                        { sur: [], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 6
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 7
                        { sur: [], este: []}, // 8
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: []}, // 9
                        { sur: [], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 10
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 11
                        { sur: [], este: []}, // 12
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: []}, // 13
                        { sur: [], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 14
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 15
                        {}, {}, {}, {},
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 20
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 21
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 22
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}]; // 23
    var posible = false;
    
    switch(posicion){
        case 1: // Carta1 encima de carta2
            if(compatibilidad[carta1.Valor].sur !== undefined){
                compatibilidad[carta1.Valor].sur.forEach(function(p){
                    if(p === carta2.Valor) posible = true;
                });
            }            
            break;
        case 2: // Carta1 a la derecha de carta2
            if(compatibilidad[carta2.Valor].este !== undefined){
                compatibilidad[carta2.Valor].este.forEach(function(p){
                    if(p === carta1.Valor) posible = true;
                });
            }
            break;
        case 3: // Carta1 debajo de carta2
            if(compatibilidad[carta2.Valor].sur !== undefined){
                compatibilidad[carta2.Valor].sur.forEach(function(p){
                    if(p === carta1.Valor) posible = true;
                });
            }
            break;
        case 4: // Carta1 a la izquierda de carta2
            if(compatibilidad[carta1.Valor].este !== undefined){
                compatibilidad[carta1.Valor].este.forEach(function(p){
                    if(p === carta2.Valor) posible = true;
                });
            }
            break;
    }
    
    return posible;
}

function compruebaDisponiblidadTotal(tablero, cartaInsertar, x, y){
    var compatible = true;
    if(x > 0){
        if(tablero[x-1][y] !== undefined && tablero[x-1][y] !== -1){
            if(!esCompatible(tablero[x-1][y], cartaInsertar, 1)) compatible = false;
        }
    }
    if(x < 6){
        if(tablero[x+1][y] !== undefined  && tablero[x+1][y] !== -1){
            if(!esCompatible(tablero[x+1][y], cartaInsertar, 3)) compatible = false;
        }
    }
    if(y > 0){
        if(tablero[x][y-1] !== undefined  && tablero[x][y-1] !== -1){
            if(!esCompatible(tablero[x][y-1], cartaInsertar, 4)) compatible = false;
        }
    }
    if(y < 6){
        if(tablero[x][y+1] !== undefined  && tablero[x][y+1] !== -1){
            if(!esCompatible(tablero[x][y+1], cartaInsertar, 2)) compatible = false;
        }
    }
    
    return compatible;
}

function esCompatible(carta1, carta2, posicion){
    var compatibilidad = [ {},
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [1, 2, 3, 4, 5, 6, 7]}, // 1
                        { sur: [1, 2, 3, 8, 9, 10, 11], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 2
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 3
                        { sur: [1, 2, 3, 8, 9, 10, 11], este: [1, 2, 3, 4, 5, 6, 7]}, // 4
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [1, 2, 3, 4, 5, 6, 7]}, // 5
                        { sur: [1, 2, 3, 8, 9, 10, 11], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 6
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 7
                        { sur: [1, 2, 3, 8, 9, 10, 11], este: [1, 2, 3, 4, 5, 6, 7]}, // 8
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [1, 2, 3, 4, 5, 6, 7]}, // 9
                        { sur: [1, 2, 3, 8, 9, 10, 11], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 10
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 11
                        { sur: [1, 2, 3, 8, 9, 10, 11], este: [1, 2, 3, 4, 5, 6, 7]}, // 12
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [1, 2, 3, 4, 5, 6, 7]}, // 13
                        { sur: [1, 2, 3, 8, 9, 10, 11], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 14
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 15
                        {}, {}, {}, {},
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 20
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 21
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}, // 22
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23], este: [8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23]}]; // 23
    var compatible = false;
    
    switch(posicion){
        case 1: // Carta1 encima de carta2
            if(compatibilidad[carta1.Valor].sur !== undefined){
                compatibilidad[carta1.Valor].sur.forEach(function(p){
                    if(p === carta2.Valor) compatible = true;
                });
            }            
            break;
        case 2: // Carta1 a la derecha de carta2
            if(compatibilidad[carta2.Valor].este !== undefined){
                compatibilidad[carta2.Valor].este.forEach(function(p){
                    if(p === carta1.Valor) compatible = true;
                });
            }
            break;
        case 3: // Carta1 debajo de carta2
            if(compatibilidad[carta2.Valor].sur !== undefined){
                compatibilidad[carta2.Valor].sur.forEach(function(p){
                    if(p === carta1.Valor) compatible = true;
                });
            }
            break;
        case 4: // Carta1 a la izquierda de carta2
            if(compatibilidad[carta1.Valor].este !== undefined){
                compatibilidad[carta1.Valor].este.forEach(function(p){
                    if(p === carta2.Valor) compatible = true;
                });
            }
            break;
    }
    
    return compatible;
}

function comprobarFinalPartida(tablero, cartaInsertada, jugadores, callback){
    var final = false;
     
    if(cartaInsertada.PosY === 5){
        if(cartaInsertada.PosX === 1 || cartaInsertada.PosX === 3 || cartaInsertada.PosX === 5){
            if(tablero[cartaInsertada.PosX][6].Valor === 22){
                final = true;
            }
            desbloqueaCarta(cartaInsertada.PosX, tablero[cartaInsertada.PosX][6], cartaInsertada, jugadores, function(err){
                if(err){
                    callback(err);                    
                }
                else{
                    callback(null, final);
                }
            });        
        }
        else{
            callback(null, final);
        }
    }
    else if (cartaInsertada.PosY === 6){
        if(cartaInsertada.PosX === 0){
            if(tablero[cartaInsertada.PosX+1][6].Valor === 22){
                final = true;
            }
            desbloqueaCarta(cartaInsertada.PosX+1, tablero[cartaInsertada.PosX+1][6], cartaInsertada, jugadores, function(err){
                if(err){
                    callback(err);                    
                }
                else{
                    callback(null, final);
                }
            });
        }
        else if(cartaInsertada.PosX === 6){
            if(tablero[cartaInsertada.PosX-1][6].Valor === 22){
                final = true;
            }
            desbloqueaCarta(cartaInsertada.PosX-1, tablero[cartaInsertada.PosX-1][6], cartaInsertada, jugadores, function(err){
                if(err){
                    callback(err);                    
                }
                else{
                    callback(null, final);
                }
            });
        } 
        else if(cartaInsertada.PosX === 2 || cartaInsertada.PosX === 4){
            if(tablero[cartaInsertada.PosX+1][6].Valor === 22){
                final = true;
            }
            if(tablero[cartaInsertada.PosX-1][6].Valor === 22){
                final = true;
            }       
            desbloqueaCarta(cartaInsertada.PosX+1, tablero[cartaInsertada.PosX+1][6], cartaInsertada, jugadores, function(err){
                if(err){
                    callback(err);
                    
                }
                else{
                    desbloqueaCarta(cartaInsertada.PosX-1, tablero[cartaInsertada.PosX-1][6], cartaInsertada, jugadores, function(err){
                        if(err){
                            callback(err);                    
                        }
                        else{
                            callback(null, final);
                        }
                    });
                }
            });
            
        }
        else{
            callback(null, final);
        }
    }
    else{
        callback(null, final);
    }
}

function desbloqueaCarta(x, carta, cartaInsertada, jugadores, callback){
    jugadores.forEach(function(j, index, array){                    
        var cartaDesbloqueada = {};
        cartaDesbloqueada.nick = j.Nick;
        cartaDesbloqueada.nombrePartida = cartaInsertada.NombrePartida;
        cartaDesbloqueada.posX = x;
        cartaDesbloqueada.posY = 6;
        cartaDesbloqueada.valor = carta.Valor;
        DAO.desbloquearCartaFinalesJugador(j, cartaDesbloqueada, function(err){                        
            if(err){
                callback(err);
            }
            else{
                if(index === array.length - 1){
                    callback(null);
                }
            }
        });
    });
}

module.exports = {
    obtenerPosicionesPosibles: obtenerPosicionesPosibles,
    comprobarFinalPartida: comprobarFinalPartida
};

