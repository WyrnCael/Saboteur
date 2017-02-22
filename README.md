# Saboteur

Práctica para la asignatura de Aplicaciones Web del juego Saboteur.

## Características

 - Inscripción de usuarios.
 - Creación de partidas.
 - Inscripción en partidas abiertas.
 - Panel de usuarios.
 - Panel de partida.
 - Panel de partidas terminadas.

### Reglas del juego

En este juego cada jugador toma el papel de un enano que busca oro en una mina. La mina se representa
como un tablero de siete filas y siete columnas. Los jugadores parten de una casilla de
salida que se encuentra en la celda situada en la fila central, primera columna. En la última columna (fi-
las 2ª, 4ª y 6ª) existen tres casillas de destino. Inicialmente el contenido de esas casillas es desconocido.
Lo único que los jugadores conocen es que una de ellas contiene una pepita de oro y las dos restantes
no contienen nada.

#### Existen dos clases de jugadores: enanos buscadores y enanos saboteadores. 

Cada jugador recibe un rol (buscador o saboteador) al principio de la partida, y este rol permanece secreto para los demás 
jugadores. Los buscadores y los saboteadores tienen objetivos contrapuestos:
Los buscadores tienen como objetivo construir grutas a lo largo del tablero con el fin de llegar a
la casilla de destino que contenga la pepita de oro.
Los saboteadores tienen como objetivo bloquear y desviar las grutas de los enanos buscadores
con el fin de que éstos no consigan la pepita de oro.
La cantidad de buscadores y saboteadores depende del número total de jugadores en la partida. Cada jugador obtiene al 
inicio de la partida una serie de cartas. El número de cartas recibidas también depende de la cantidad de jugadores. El
juego transcurre por turnos. El jugador que tiene el turno puede realizar una de las siguientes acciones:

#### Colocar una de sus cartas en el tablero.

Para ello han de cumplirse los siguientes requisitos:
* Las grutas de la carta que se quiere colocar han de encajar con las grutas de las ya existentes
en el tablero. A estos efectos, los bordes del tablero no imponen ninguna
restricción (es decir, pueden colocarse cartas cuyas grutas “escapen” hacia fuera del tablero).
* La carta incorporada ha de ser alcanzable desde la casilla de salida. Es decir, debe haber un
camino desde la casilla de salida hasta la gruta recién construida
Tras haber colocado una carta, el jugador recibirá una carta nueva generada aleatoriamente.

#### Desechar una de sus cartas.

El jugador eliminará una de sus cartas (la que él/ella desee), recibiendo a continuación otra carta
generada aleatoriamente.

#### Fin del juego

Cuando el laberinto de grutas construidas alcanza una de las casillas de destino en la columna derecha,
se revelará el contenido de la casilla. Si contiene una pepita de oro, los enanos buscadores ganan la
partida. Si no contiene nada, se continúa el juego para que los buscadores puedan prolongar alguna de
las rutas construidas a otra de las casillas de destino. Por el contrario, si ha transcurrido una cantidad
determinada de turnos (ver apéndice) sin que los buscadores hayan alcanzado la casilla que contiene
la pepita de oro, los saboteadores ganan la partida.

### Recursos utilizados

 - [Node.js](https://nodejs.org/es/)
   - [Express](http://expressjs.com/es/)
   - [Express-mysql-session](https://www.npmjs.com/package/express-mysql-session)
   - [Express-session](https://github.com/expressjs/session)
   - [Express-validator](https://github.com/ctavan/express-validator)
   - [Body-parser](https://github.com/expressjs/body-parser)
   - [Multer](https://github.com/expressjs/multer)
   - [Mysql](https://github.com/mysqljs/mysql)
 - [XAMPP](https://www.apachefriends.org/es/index.html)
