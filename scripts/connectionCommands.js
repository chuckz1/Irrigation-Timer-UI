"use strict";

//this handles generic communication processing

let connected = false;

function setConnected(value) {
	connected = value;

	//update ui
	updateConnectionStatus();
}

//what connection type is currently being used
let serialMode = false;
let wifiMode = false;

//used to define current communication with the arduino
const TransferType = {
	NONE: 0,
	REFRESH: 1,
	RESTART: 2,
	APPLY_CHANGE: 3,
	TOGGLE_TEST: 4,
	RUN_TEST: 5
}

let transferType = TransferType.NONE;
let messageCounter = 0;

//prevents multiple communication commands at the same time
let comLock = false;

function setComLock(value) {
	comLock = value;

	//update ui
	updateSendingStatus();
}

let askReloadOnConnect = true;
//called after connecting
function onConnect() {
	//update ui
	setConnected(true);

	//refresh data as well
	setTimeout(sendRefreshCommand, 100);
}

function onDisconnect() {
	//update ui
	setConnected(false);
}

//processes incoming data from the arduino
function processInfo(value) {
	console.log("[Received] " + value);

	//collecting data from a refresh command
	if (transferType == TransferType.REFRESH) {
		let parsedObject;
		switch (true) {
			case (messageCounter < 7):
				//load week day info

				//get data
				parsedObject = JSON.parse(value);

				//covert pivot on bytes to bool array
				let pivotOnBool = bytesToBoolArray(parsedObject.pivotOn);

				//deep copy arrays
				let newCutList = [];
				for (var i = 0; i < parsedObject.cutList.length; i++) {
					//cast values so that getter and setters are preserved
					newCutList.push(new TimeCut(parsedObject.cutList[i].hour, parsedObject.cutList[i].min, pivotOnBool[i]));
				}

				//apply values
				loadedData.weekDayInfo[messageCounter].usedCuts = parsedObject.usedCuts;
				loadedData.weekDayInfo[messageCounter].cutList = newCutList;

				messageCounter++;
				break;
			case (messageCounter == 7):
				//load holiday info

				//get data
				parsedObject = JSON.parse(value);

				//deep copy arrays
				let newHolidayTimeSlots = [];
				for (var i = 0; i < parsedObject.holidayTimeSlots.length; i++) {
					//reduce day value by one
					parsedObject.holidayTimeSlots[i].dayRestrict -= 1;
					//cast values so that getter and setters are preserved
					newHolidayTimeSlots.push(Object.assign(new HolidaySlot, parsedObject.holidayTimeSlots[i]));
				}

				//apply values
				loadedData.holidayInfo.usedHolidaySlots = parsedObject.usedHolidaySlots;
				loadedData.holidayInfo.holidayTimeSlots = newHolidayTimeSlots;

				messageCounter++;
				break;
			case (messageCounter == 8):
				//load procedure info

				//get data
				parsedObject = JSON.parse(value);

				//get start procedure
				loadedData.startProcedure.defaultRelayOn = parsedObject.startProcedure.defaultRelayOn;
				loadedData.startProcedure.usedCuts = parsedObject.startProcedure.usedCuts;
				//deep copy array
				let newStartCutList = [];
				for (var i = 0; i < parsedObject.startProcedure.cutList.length; i++) {
					newStartCutList.push(Object.assign(new ProcedureCut, parsedObject.startProcedure.cutList[i]));
				}
				loadedData.startProcedure.cutList = newStartCutList;

				//get stop procedure
				loadedData.stopProcedure.defaultRelayOn = parsedObject.stopProcedure.defaultRelayOn;
				loadedData.stopProcedure.usedCuts = parsedObject.stopProcedure.usedCuts;
				//deep copy array
				let newStopCutList = [];
				for (var i = 0; i < parsedObject.stopProcedure.cutList.length; i++) {
					newStopCutList.push(Object.assign(new ProcedureCut, parsedObject.stopProcedure.cutList[i]));
				}
				loadedData.stopProcedure.cutList = newStopCutList;

				messageCounter++;
				break;
			case (messageCounter == 9):
				//load extra info

				//get data
				parsedObject = JSON.parse(value);

				//display gps time
				updateGPSTime(parsedObject.gpsHour, parsedObject.gpsMin);

				//get constants
				maxCutsPerDay = parsedObject.maxCutsPerDay;
				maxHolidays = parsedObject.maxHolidaySlots;

				//set testing mode
				setTestingMode(parsedObject.testingMode);

				//get general settings
				loadedData.generalSettings.wifiEnabled = parsedObject.wifiEnabled;
				loadedData.generalSettings.wifiSSID = parsedObject.wifiSSID;
				loadedData.generalSettings.wifiPassword = parsedObject.wifiPassword;

				//set the data as clean
				loadedData.dirty = false;

				//mark transmision complete
				CommandFinished();

				//refresh the ui
				refreshUI();
				break;
		}
	} else if (transferType == TransferType.APPLY_CHANGE) {
		if (!value.includes("Saved Changes")) {
			if (!value.includes("Modified")) {
				writeToErrorLog("[From brain]: " + value, false);
				console.log("length: " + value.length + ", " + "Saved Changes".length);
				console.log("char: " + value.charCodeAt(0) + ", " + "Saved Changes".charCodeAt(0));
				console.log("end char: " + value.charCodeAt(value.length - 1) + ", " + "Saved Changes".charCodeAt("Saved Changes".length - 1));
			}
		} else {
			//all data hase been sent
			//mark transmision complete
			CommandFinished();

			//refresh the data to sync changes and ensure everything saved correctly
			sendRefreshCommand();
		}
	} else if (transferType == TransferType.TOGGLE_TEST) {
		//reponse from toggling test mode
		//mark transmision complete
		CommandFinished();

		//refresh the data to sync changes and ensure everything saved correctly
		sendRefreshCommand();
	} else if (transferType == TransferType.RUN_TEST) {
		//process response
		let message = value.split(",");

		if (message[0].includes("Test Results")) {
			let testResults = new TestResults();
			testResults.pivotOn = parseInt(message[1]);
			testResults.relayOn = parseInt(message[2]);

			testHandler.addResult(testResults);

			//mark transmision complete
			CommandFinished();
		} else if (!value.includes("Test queued")) {
			writeToErrorLog("[From brain]: " + value, false);
		}
	} else if (transferType == TransferType.RESTART) {
		//mark transmision complete
		CommandFinished();
	}
}

//do check to make sure a command can be sent
async function CommandSetup(_transferType) {
	//validate args
	console.log();
	if (typeof _transferType != "number") {
		writeToErrorLog("Invalid Transfer Type: " + (typeof _transferType));
		return false;
	}

	//check that we are connected
	if (!serialMode && !wifiMode) {
		writeToErrorLog("Not Connected");
		return false;
	}

	//wait for com lock to release
	let counter = 0;
	const sleepInterval = 50;
	const maxSleepTime = 3000;
	while (comLock) {
		if ((counter * sleepInterval) < maxSleepTime) {
			counter++;
			await sleep(sleepInterval);
		} else {
			writeToErrorLog("Communication took to long. Consider reconecting");
			return false;
		}
	}

	//reserve the comLock for this function
	setComLock(true);

	//set transferType
	transferType = _transferType;

	//set message count to 0
	messageCounter = 0;

	return true;
}

//resets states so the next command can be sent
function CommandFinished() {
	//set transferType
	transferType = TransferType.NONE;

	//set message count to 0
	messageCounter = 0;

	//release the comLock
	setComLock(false);
}


//sends refresh request to the arduino
async function sendRefreshCommand() {
	//prepare to send the command
	if (!await CommandSetup(TransferType.REFRESH)) {
		return;
	}

	//send data
	if (serialMode) {
		writeToStream("refresh");
	} else if (wifiMode) {
		sendWifiMessage("refresh");
	}
	else {
		setComLock(false);
		writeToErrorLog("Communication protocol was not found");
	}
}

//sends data to save to the arduino
async function sendApplyChanges() {
	//prepare to send the command
	if (!await CommandSetup(TransferType.APPLY_CHANGE)) {
		return;
	}

	//create payload
	let payLoad = [];

	//send normal info
	for (var i = 0; i < 7; i++) {
		let normalMessage = "slot," + i + "," + JSON.stringify(loadedData.weekDayInfo[i]);
		payLoad.push(normalMessage);
	}

	//send holiday info
	if (loadedData.holidayInfo.usedHolidaySlots > 0) {
		for (var i = 0; i < loadedData.holidayInfo.usedHolidaySlots; i++) {
			//build message
			let holidayMessage = "holiday,";
			holidayMessage += i + ","; //slot index
			holidayMessage += loadedData.holidayInfo.usedHolidaySlots + ","; //used slots
			holidayMessage += loadedData.holidayInfo.holidayTimeSlots[i].pivotOn + ","; //relay status
			holidayMessage += loadedData.holidayInfo.holidayTimeSlots[i].beginHour + ","; //begin hour
			holidayMessage += loadedData.holidayInfo.holidayTimeSlots[i].beginMin + ","; //begin min
			holidayMessage += loadedData.holidayInfo.holidayTimeSlots[i].endHour + ","; //end hour
			holidayMessage += loadedData.holidayInfo.holidayTimeSlots[i].endMin + ","; //end min
			holidayMessage += loadedData.holidayInfo.holidayTimeSlots[i].holidayMonthRestrict + ","; //holiday month restrict

			//only extract info for the correct holiday type
			let dayRestrict = -1;
			let holidayWeekRestrict = 0;
			let holidayweekDayRestrict = -1;
			if (loadedData.holidayInfo.holidayTimeSlots[i].holidayWeekRestrict == 0) {
				//specific day holiday
				dayRestrict = (loadedData.holidayInfo.holidayTimeSlots[i].dayRestrict + 1);

			} else {
				//day of the week holiday
				holidayWeekRestrict = loadedData.holidayInfo.holidayTimeSlots[i].holidayWeekRestrict;
				holidayweekDayRestrict = loadedData.holidayInfo.holidayTimeSlots[i].holidayweekDayRestrict;
			}

			holidayMessage += dayRestrict + ","; //day restrict
			holidayMessage += holidayWeekRestrict + ","; //week restrict
			holidayMessage += holidayweekDayRestrict + ","; //week day 

			//send message
			payLoad.push(holidayMessage);
		}
	} else {
		//clear holidays
		//build message
		let holidayMessage = "holiday,";
		holidayMessage += 0 + ","; //slot index
		holidayMessage += 0 + ","; //used slots
		holidayMessage += 0 + ","; //relay status
		holidayMessage += 0 + ","; //begin hour
		holidayMessage += 0 + ","; //begin min
		holidayMessage += 0 + ","; //end hour
		holidayMessage += 0 + ","; //end min
		holidayMessage += 0 + ","; //holiday month restrict
		holidayMessage += -1 + ","; //day restrict
		holidayMessage += 0 + ","; //week restrict
		holidayMessage += 0 + ","; //week day 

		//send message
		payLoad.push(holidayMessage);
	}

	//send procedure info
	payLoad.push("procedure,0," + JSON.stringify(loadedData.startProcedure));
	payLoad.push("procedure,1," + JSON.stringify(loadedData.stopProcedure));

	//send general settings
	let settingsMessage = "settings,";
	settingsMessage += loadedData.generalSettings.wifiEnabled + ",";
	settingsMessage += loadedData.generalSettings.wifiSSID + ",";
	settingsMessage += loadedData.generalSettings.wifiPassword + ",";
	payLoad.push(settingsMessage);

	//tell the arduino to commit the changes
	payLoad.push("save");

	//send data
	if (serialMode) {
		//send payload
		while (payLoad.length > 0) {
			writeToStream(payLoad.shift());
		}

		//restart the arduino so that wifi settings changes are applied
		restartArduino();
	} else if (wifiMode) {
		//send payload
		while (payLoad.length > 0) {
			await sendWifiMessage(payLoad.shift());
		}

		//restart the arduino so that wifi settings changes are applied
		restartArduino();
	} else {
		setComLock(false);
		writeToErrorLog("Communication protocol was not found");
	}


}

//restarts the arduino
async function restartArduino() {
	//prepare to send the command
	if (!await CommandSetup(TransferType.RESTART)) {
		return;
	}

	//send data
	if (serialMode) {
		//tell the arduino restart
		writeToStream("restart");
	} else if (wifiMode) {
		//tell the arduino restart
		sendWifiMessage("restart");
	} else {
		setComLock(false);
		writeToErrorLog("Communication protocol was not found");
	}
}

//puts the arduino in test mode
async function toggleTestMode(isOn) {
	//validate args
	if (isOn === undefined) {
		isOn = false;
	}

	//prepare to send the command
	if (!await CommandSetup(TransferType.TOGGLE_TEST)) {
		return;
	}

	//send data
	if (serialMode) {
		//tell the arduino to set test mode
		writeToStream("testMode," + String(isOn));
	} else if (wifiMode) {
		//tell the arduino to set test mode
		sendWifiMessage("testMode," + String(isOn));
	} else {
		setComLock(false);
		writeToErrorLog("Communication protocol was not found");
	}
}

async function sendSingleTest(testData) {
	//validate args
	if (!testData instanceof TimeTestStruct) {
		return;
	}

	//prepare to send the command
	if (!await CommandSetup(TransferType.RUN_TEST)) {
		return;
	}

	//create message
	//tell the arduino run a test
	let message = "testRun,";

	//add parameters
	//time since epoch in seconds
	message += Math.floor(testData.date.getTime() / 1000) + ",";
	//minutes after the procedure has been started
	message += testData.procedureMin + ",";

	//send data
	if (serialMode) {
		writeToStream(message);
	} else if (wifiMode) {
		sendWifiMessage(message);
	} else {
		setComLock(false);
		writeToErrorLog("Communication protocol was not found");
	}
}