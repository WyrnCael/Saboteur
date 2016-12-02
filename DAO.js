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
    conexion.connect(function (err) {
    if (err) {
        console.error(err);
    } else {
        conexion.query("INSERT INTO Usuarios(Nick, Contraseña, Nombre, Sexo, Imagen, Nacimiento, Herramienta)" + 
                       "VALUES (?, ?, ?, ?, ?, ?, ?)", [datosUsuario["datosNuevoUsuario"].usuario, datosUsuario["datosNuevoUsuario"].contraseña,
                        datosUsuario["datosNuevoUsuario"].nombre, datosUsuario["datosNuevoUsuario"].sexo, datosUsuario["datosNuevoUsuario"].foto, datosUsuario["datosNuevoUsuario"].nacimiento, false],
            function(err, rows) {
                if (err) {
                    console.error(err);
                } else {
                   console.log("Guardado!")
                }
                conexion.end();
            });
        }
    });
}

function bajaUsuario(){
    
}

module.exports = {
    altaUsuario: altaUsuario,
    bajaUsuario: bajaUsuario
}
