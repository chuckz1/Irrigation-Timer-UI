"use strict";

//this handles making a serial connection

//serial port
let port;
let reader;
let inputDone;
let outputDone;
let inputStream;
let outputStream;

//input field for baudrate selection
const baudRate = document.getElementById("baudRateField");

//connect button 
const butConnect = document.getElementById("connect");

//when connect button is pressed
async function serialConnectBtn() {
	//disconnect
	if (port) {
		//send disconnect
		await serialDisconnect();

		//update button
		butConnect.textContent = "Connect";

		//sets connection commands
		serialMode = false;

		//run disconnect commands
		onDisconnect();

		return;
	}

	//connect
	await serialConnect();

	//toggle what the button displays
	butConnect.textContent = "Disconnect";

	//sets connection commands
	serialMode = true;

	//run connect commands
	onConnect();
}

//creates a serial connection
async function serialConnect() {
	//ask user to select a port
	port = await navigator.serial.requestPort();

	//open port async with selected baudrate
	try {
		await port.open({ baudRate: baudRate.value });
	} catch (err) {
		// console.error(err);

		//set the port back to null
		port = null;

		//display failed
		writeToErrorLog(err);
		return;
	}

	//create out stream
	const encoder = new TextEncoderStream();
	outputDone = encoder.readable.pipeTo(port.writable);
	outputStream = encoder.writable;

	//used to stop echoing?
	// writeToStream("\x03", "echo(false);");

	//set up input stream
	let decoder = new TextDecoderStream();
	inputDone = port.readable.pipeTo(decoder.writable);
	inputStream = decoder.readable.pipeThrough(
		new TransformStream(new LineBreakTransformer())
	);

	//create reader object that monitors the stream
	reader = inputStream.getReader();

	//wait for incoming data
	readLoop();
}

//closes a connected serial port
async function serialDisconnect() {
	//close reader object monitoring the stream
	if (reader) {
		await reader.cancel();
		await inputDone.catch(() => { });
		reader = null;
		inputDone = null;
	}

	//close the output stream
	if (outputStream) {
		await outputStream.getWriter().close();
		await outputDone;
		outputStream = null;
		outputDone = null;
	}

	//close the port
	try {
		await port.close();
	} catch (err) {
		console.error(err);

		//display failed closing
		writeToErrorLog(err);
	}

	port = null;
}

//loop that gets incoming serial data from the reader object
let serialBuffer = "";
async function readLoop() {
	while (true) {
		const { value, done } = await reader.read();
		if (value) {
			processInfo(value);
		}
		if (done) {
			console.log("[readLoop] DONE - Serial quit", done);
			reader.releaseLock();
			break;
		}
	}
}

//send data to arduino (takes a string)
function writeToStream(...lines) {
	const writer = outputStream.getWriter();
	lines.forEach((line) => {
		console.log("[SEND]", line);

		writer.write(line + "\n");
	});
	writer.releaseLock();
}

//this is the reader class
class LineBreakTransformer {
	constructor() {
		// A container for holding stream data until a new line.
		this.container = "";
	}

	transform(chunk, controller) {
		this.container += chunk;
		this.container.replace("\r\n", '\n');
		this.container.replace(/\r/g, '');
		const lines = this.container.split("\n");
		this.container = lines.pop();
		// console.log("Chunk \"" + chunk + "\", Remaining Container: " + this.container);
		lines.forEach((line) => controller.enqueue(line));
	}

	flush(controller) {
		controller.enqueue(this.container);
	}
}