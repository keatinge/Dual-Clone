var app = require("express")();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);


app.get("/", function (req, res){
    console.log("index requested");
    res.sendFile(__dirname + "/index.html");
});

let queue = [];
io.on("connection", function (socket){
    if (queue.length == 0) {
        console.log("queue is empty, adding user to queue");
        queue.push(socket);
    }
    else {
        let matchedSocket = queue.pop();
        console.log(`pairing two users, queue is now ${queue.length} long`);
        handleGame(matchedSocket, socket);
    }
});


function handleGame(player1Socket, player2Socket) {
    let defaultState = {x: 50, y: 0, xVel : 0, yVel: 0};

    
    var players = [
        {socket : player1Socket, enemySocket : player2Socket, id: 0, state : defaultState},
        {socket : player2Socket, enemySocket : player1Socket, id: 1, state : defaultState}
    ];
    

    players.forEach(function (player){

        console.log("broadcasting enemy initial state to both players");
        player.enemySocket.emit("addEnemyRect", player.state);


        player.socket.on("moveRect", function (state) {
            //console.log(`player ${player.id} state is now ${JSON.stringify(state)}`);
            player.state = state;

            //console.log("broadcasting position to enemy");
            //transformation is handled client side
            player.enemySocket.emit("enemyMoved", state);
        });


        player.socket.on("shoot", function (bullet){
            //transformation is handled client side
            player.enemySocket.emit("enemyShoot", bullet);

            console.log(bullet);
        })
    });





}
    
