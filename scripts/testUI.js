"use strict";

let testingMode = false;

//update ui
function setTestingMode(_newValue) {
	//validate args
	if (_newValue === undefined) {
		return;
	}

	//set the value
	testingMode = _newValue;

	//hide / show testing mode
	//hide / show gps since it breaks in test mode
	document.getElementById("testingModeContent").hidden = !testingMode;
	document.getElementById("gpsTimeDisplayContainer").hidden = testingMode;

	//display new connection status
	updateConnectionStatus();
}


//data structure
function TimeTestStruct() {
	this.pending = false;
	this.date = new Date();
	this.procedureMin = 0;
	this.relayOn = -1;
}

function TestResults(_pivotOn, _relayOn){
	this.pivotOn = false;
	this.relayOn = -1;

	//validate and assign args
	if (_pivotOn !== undefined) {
		pivotOn = _pivotOn;
	}

	if (_relayOn !== undefined) {
		relayOn = _relayOn;
	}
}

//brain that handles test responses
function TestBrain() {
	var pendingTests = [];
	var testResults = [];

	this.pendingTests = pendingTests;
	this.testResults = testResults;

	this.addTest = function (test) {
		//validate args
		if (!test instanceof TimeTestStruct) {
			return;
		}

		//add test to the buffer
		pendingTests.push(test);

		//check the buffers
		processBuffers();
	}

	this.addResult = function (result) {
		//validate args
		if (!result instanceof TestResults || isNaN(result.pivotOn) || isNaN(result.relayOn)) {
			return;
		}
		//add test result to the buffer
		testResults.push(result);

		//check the buffers
		processBuffers();
	}

	function processBuffers() {
		if (pendingTests.length > 0 && testResults.length > 0) {
			//process results
			displayTestResult(testResults[0]);
			if (testResults[0].relayOn != pendingTests[0].relayOn && pendingTests[0].relayOn != -1) {
				//test failed

				//create error message
				let message = "Test Failed:\n";

				//print time info
				message += "- Date: " + pendingTests[0].date.toString() + "\n";

				//print expected relay info
				message += "- Relays Expected On: \n";
				for (var i = 0; i < 4; i++) {
					//create mask
					let mask = 1 << i;

					//check mask
					message += "Relay " + i;
					if (pendingTests[0].relayOn & mask) {
						message += ": on\n";
					} else {
						message += ": off\n";
					}
				}

				//print real relay info
				message += "- Relay Results: \n";
				for (var i = 0; i < 4; i++) {
					//create mask
					let mask = 1 << i;

					//check mask
					message += "Relay " + i;
					if (testResults[0].relayOn & mask) {
						message += ": on\n";
					} else {
						message += ": off\n";
					}
				}

				writeToErrorLog(message, false);
			}

			//remove results
			pendingTests.shift();
			testResults.shift();

			//send the next test
			if (pendingTests.length > 0) {
				sendTest();
			} else {
				writeToErrorLog("All tests complete", false);
			}
		} else if (pendingTests.length == 1 && pendingTests[0].pending == false) {
			//new test has been added
			//start processing the chain
			sendTest();
		}
	}

	function sendTest() {
		//sends the first test in the pending tests buffer
		sendSingleTest(pendingTests[0]);
		pendingTests[0].pending = true;
	}

}
let testHandler = new TestBrain();


//displays the gps time reported by the gps
function updateGPSTime(gpsHour, gpsMin) {
	if (gpsHour != -1) {
		document.getElementById("gpsTimeDisplay").textContent = String(gpsHour).padStart(2, "0") + ":" + String(gpsMin).padStart(2, "0");
	} else {
		document.getElementById("gpsTimeDisplay").textContent = "Not connected to satellites yet";
	}
}

//sets the relay button colors in the test menu
//e.g. displayTestResult(true, false, true, false);
function displayTestResult(testResults) {
	//validate args
	if (!testResults instanceof TestResults) {
		return;
	} else {
		//display pivot status
		let pivotStatusDisplay = document.getElementById("testPivotOnDisplay");
		if (testResults.pivotOn == -1) {
			pivotStatusDisplay.textContent = "Pivot On";
			pivotStatusDisplay.classList.remove("valid");
			pivotStatusDisplay.classList.remove("invalid");
		} else if (testResults.pivotOn == true) {
			pivotStatusDisplay.textContent = "Pivot On";
			pivotStatusDisplay.classList.add("valid");
			pivotStatusDisplay.classList.remove("invalid");

		} else {
			pivotStatusDisplay.textContent = "Pivot Off";
			pivotStatusDisplay.classList.add("invalid");
			pivotStatusDisplay.classList.remove("valid");
		}


		//display relay statuses
		let relayContainer = document.getElementById("testRelayDisplayContainer");

		for (var i = 0; i < 4; i++) {
			if (testResults.relayOn == -1) {
				//reset to default
				relayContainer.children[i].classList.remove("valid");
				relayContainer.children[i].classList.remove("invalid");
			} else {
				//set values
				//create mask
				let mask = 1 << i;

				//check mask
				if (testResults.relayOn & mask) {
					//valid
					relayContainer.children[i].classList.add("valid");
					relayContainer.children[i].classList.remove("invalid");
				} else {
					//invalid
					relayContainer.children[i].classList.add("invalid");
					relayContainer.children[i].classList.remove("valid");
				}
			}
		}
	}
}

function toggleTestingModeClick() {
	//notify the arduino
	toggleTestMode(!testingMode);
}

//tests all current settings against saved times
function verifySettings() {

}

function testSingleTimeClick() {
	//remove any previous test results
	let clearTest = new TestResults();
	clearTest.pivotOn = -1;
	clearTest.relayOn = -1;
	displayTestResult(clearTest);

	//create new test
	var newTest = new TimeTestStruct();
	newTest.procedureMin = parseInt(document.getElementById("testProcedureMinInput").value);
	newTest.date = new Date(document.getElementById("testSingleTimeInput").value);

	//validate parameters
	if(isNaN(newTest.procedureMin) || isNaN(newTest.date)){
		return;
	}

	testHandler.addTest(newTest);
}