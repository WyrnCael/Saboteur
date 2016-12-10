"use strict";

function obtenerPosicionesPosibles(tablero, cartaActual, cartaInsertar){
    var x = cartaActual.PosX;
    var y = cartaActual.PosY;
    
    if(x > 0){
        if(tablero[x-1][y] === undefined){
            if(esCompatible(cartaInsertar, cartaActual, 1)) tablero[x-1][y] = -1;
        } else{
            obtenerPosicionesPosibles(tablero, tablero[x-1][y], cartaInsertar);
        }
    }
    if(y > 0){
        if(tablero[x][y-1] === undefined){
            if(esCompatible(cartaInsertar, cartaActual, 4)) tablero[x][y-1] = -1;
        } else{
            obtenerPosicionesPosibles(tablero, tablero[x][y-1], cartaInsertar);
        }
    }
    if(x < 5){
        if(tablero[x+1][y] === undefined){
            if(esCompatible(cartaInsertar, cartaActual, 3)) tablero[x+1][y] = -1;
        } else{
            obtenerPosicionesPosibles(tablero, tablero[x+1][y], cartaInsertar);
        }
    }
    if(y < 5){
        if(tablero[x][y+1] === undefined){
            if(esCompatible(cartaInsertar, cartaActual, 2)) tablero[x][y+1] = -1;
        } else{
            obtenerPosicionesPosibles(tablero, tablero[x][y+1], cartaInsertar);
        }
    }
}

function esCompatible(carta1, carta2, posicion){
    var compatibilidad = [ {},
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20], este: []}, // 1
                        { sur: [], este: [8, 9, 10, 11, 12, 13, 14, 15, 20]}, // 2
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20], este: [8, 9, 10, 11, 12, 13, 14, 15, 20]}, // 3
                        { sur: [], este: []}, // 4
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20], este: []}, // 5
                        { sur: [], este: [8, 9, 10, 11, 12, 13, 14, 15, 20]}, // 6
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20], este: [8, 9, 10, 11, 12, 13, 14, 15, 20]}, // 7
                        { sur: [], este: []}, // 8
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20], este: []}, // 9
                        { sur: [], este: [8, 9, 10, 11, 12, 13, 14, 15, 20]}, // 10
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20], este: [8, 9, 10, 11, 12, 13, 14, 15, 20]}, // 11
                        { sur: [], este: []}, // 12
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20], este: []}, // 13
                        { sur: [], este: [8, 9, 10, 11, 12, 13, 14, 15, 20]}, // 14
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20], este: [8, 9, 10, 11, 12, 13, 14, 15, 20]}, // 15
                        {}, {}, {}, {},
                        { sur: [4, 5, 6, 7, 12, 13, 14, 15, 20], este: [8, 9, 10, 11, 12, 13, 14, 15, 20]} ]; // 20
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

module.exports = {
    obtenerPosicionesPosibles: obtenerPosicionesPosibles
};

