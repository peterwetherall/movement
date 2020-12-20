let wrapper = {};

wrapper.keyboard = {
	"left": false,
	"right": false,
	"up": false,
	"down": false
};

wrapper.keyboardChange = (data) => {
	wrapper.socket.emit("m", data);
};

wrapper.updateKeyboard = (code, value) => {
	let old = Object.assign({}, wrapper.keyboard);
	switch (code) {
		case 65: //A
		case 37: //Left arrow
			wrapper.keyboard.left = value;
			break;
		case 68: //D
		case 39: //Right arrow
			wrapper.keyboard.right = value;
			break;
		case 87: //W
		case 38: //Up arrow
			wrapper.keyboard.up = value;
			break;
		case 83: //S
		case 40: //Down arrow
			wrapper.keyboard.down = value;
			break;
	}
	let change = false;
	let data = [];
	for (let i in wrapper.keyboard) {
		data.push(wrapper.keyboard[i]);
		if (wrapper.keyboard[i] != old[i]) {
			change = true;
		}
	}
	if (change) {
		wrapper.keyboardChange(data);
	}
};

document.addEventListener("keydown", e => {
	wrapper.updateKeyboard(e.keyCode, true);
});

document.addEventListener("keyup", e => {
	wrapper.updateKeyboard(e.keyCode, false);
});

window.onload = () => {
	
	wrapper.socket = io("http://localhost:8080");

	wrapper.canvas = document.getElementsByTagName("canvas")[0];
	wrapper.ctx = wrapper.canvas.getContext("2d");
	
	wrapper.socket.on("u", binary => {
		let data = JSON.parse(new TextDecoder().decode(binary));
		wrapper.ctx.clearRect(0, 0, wrapper.canvas.width, wrapper.canvas.height);
		for (let player in data) {
			if (player != wrapper.socket.id) {
				wrapper.ctx.fillStyle = "white";
			} else {
				wrapper.ctx.fillStyle = "red";
			}
			wrapper.ctx.beginPath();
			wrapper.ctx.arc(data[player][0] * 10 + 5, data[player][1] * 10 + 5, 5, 0, Math.PI * 2);
			wrapper.ctx.fill();
		}
	});
	
};