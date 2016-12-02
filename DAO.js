/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var mysql = require("mysql");

var conexion = mysql.createConnection({
    host:  "localhost",
    user:  "root",
    password: "",
    database: "Saboteur"
});

function altaUsuario(datosUsuario){
    console.log(datosUsuario);
    console.log(datosUsuario["datosNuevoUsuario"].usuario);
}

function bajaUsuario(){
    
}

module.exports = {
    altaUsuario: altaUsuario,
    bajaUsuario: bajaUsuario
}
