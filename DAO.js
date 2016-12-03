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
        conexion.query("INSERT INTO Usuarios(Nick, Contraseña, Nombre, Sexo, Imagen, Nacimiento)" + 
                       "VALUES (?, ?, ?, ?, ?, ?)", [datosUsuario.usuario, datosUsuario.contraseña,
                        datosUsuario.nombre, datosUsuario.sexo, datosUsuario.foto, datosUsuario.nacimiento],
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
