const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {});
const port = 8080;

let size = 50;
let speed = 0.2;
let framerate = 60;

let store = {};
let positions = {};

app.use(express.static("public"));

io.on("connection", socket => {
	console.log("Connection: " + socket.id);
	store[socket.id] = {
		"keyboard": [false, false, false, false],
		"hidden data": "that is kept server side lol"
	};
	positions[socket.id] = [
		Math.floor(Math.random() * size),
		Math.floor(Math.random() * size)
	];
	
	//Movement emitted by socket (update of keyboard)
	socket.on("m", data => {
		try {
			//Verify data is an array of length 4
			if (data.constructor == Array) {
				if (data.length == 4) {
					//Check each item provided is a boolean
					let valid = true;
					for (let i = 0; i < 3; i++) {
						if (typeof data[i] !== "boolean") {
							valid = false;
							break;
						}
					}
					if (valid) {
						store[socket.id].keyboard = data;
					}
				}
			}
		} catch (e) {
			//Dump error
			console.log(e);
		}
	});
	
	//Socket has disconnected
	socket.on("disconnect", () => {
		console.log("Disconnection: " + socket.id);
		delete store[socket.id];
		delete positions[socket.id];
	});
});

server.listen(port, () => {
  console.log("Listening at http://localhost:" + port);
});

let strToAB = str => {
  return new Uint8Array(str.split("").map(c => c.charCodeAt(0))).buffer;
};

setInterval(() => {
	//Update positions if required
	for (let socketID in store) {
		let kb = store[socketID].keyboard;
		//Move left
		if (kb[0] && !kb[1]) {
			positions[socketID][0] -= speed;
			if (positions[socketID][0] < 0) {
				positions[socketID][0] = 0;
			}
		//Move right
		} else if (!kb[0] && kb[1]) {
			positions[socketID][0] += speed;
			if (positions[socketID][0] > size - 1) {
				positions[socketID][0] = size - 1;
			}
		}
		//Move up
		if (kb[2] && !kb[3]) {
			positions[socketID][1] -= speed;
			if (positions[socketID][1] < 0) {
				positions[socketID][1] = 0;
			}
		//Move down
		} else if (!kb[2] && kb[3]) {
			positions[socketID][1] += speed;
			if (positions[socketID][1] > size - 1) {
				positions[socketID][1] = size - 1;
			}
		}
	}
	io.emit("u", strToAB(JSON.stringify(positions)));
}, 1000 / framerate);