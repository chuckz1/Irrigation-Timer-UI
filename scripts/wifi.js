"use strict";

//connect button 
const wifiConnectbutton = document.getElementById("wifiConnect");

async function wifiConnectClick() {
	//disconnect
	if (wifiMode) {
		//run wifi specific disconnect commands
		wifiDisconnect();

		//update button
		wifiConnectbutton.textContent = "Connect";

		//sets connection commands
		wifiMode = false;

		//run universal disconnect commands
		onDisconnect();

		return;
	}

	//connect
	if (await wifiConnect()) {
		//toggle what the button displays
		wifiConnectbutton.textContent = "Disconnect";

		//sets connection commands
		wifiMode = true;

		//run universal connect commands
		onConnect();
	}
}

async function wifiConnect() {
	writeToErrorLog("Attempting to connect. \nMake sure you connect to the correct wifi", false);
	let checkPromise;
	try {
		checkPromise = await fetch("http://192.168.4.1", {
			method: "GET",
		});
		let checkResponse = await checkPromise.text();

		if (!checkResponse.includes("Ready to receive")) {
			//throws an error
			writeToErrorLog("Failed to connect");
			return false;
		}

		writeToErrorLog("Connected", false);

		//all checks passed without an error
		return true;
	} catch (err) {
		if (err.message.includes("Failed to fetch")) {
			writeToErrorLog("Could not connect");
		} else {
			console.log("message: " + err.message);
			writeToErrorLog(err);
		}
	}

	//an error occured
	return false;
}

function wifiDisconnect() {
	//wifi specific disconnect commands
}

async function sendWifiMessage(message, requestType = "POST") {
	//create data to send
	let newForm = new FormData();
	newForm.append("wifiWrapper", message);

	//send message
	let responsePromise = await fetch("http://192.168.4.1", {
		method: requestType,
		body: newForm
	});

	let bulkResponse = await responsePromise.text();

	let responses = bulkResponse.split('\n');

	responses.forEach(processInfo);
}
