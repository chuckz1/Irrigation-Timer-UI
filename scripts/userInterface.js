"use strict";

//this handles generic changes to the user interface

//runs collapsible menus
function setupCollapsibleMenus() {
	var coll = document.getElementsByClassName("collapsible");

	for (var i = 0; i < coll.length; i++) {
		coll[i].nextElementSibling.classList.add("collapsibleContent");

		coll[i].addEventListener("click", function () {
			this.classList.toggle("active");
			var content = this.nextElementSibling;
			if (content.style.maxHeight) {
				content.style.maxHeight = null;
			} else {
				content.style.maxHeight = content.scrollHeight + "px";
			}
		});
	}
}

//used to refresh the length on menus (call twice)
function toogleCollapsibleMenus() {
	var coll = document.getElementsByClassName("collapsible");

	for (var i = 0; i < coll.length; i++) {
		coll[i].click();
	}
}

//#region global info

//updates connection status
function updateConnectionStatus() {
	if (connected) {
		document.getElementById("connectionStatus").classList.remove("invalid");

		if (testingMode) {
			document.getElementById("connectionStatus").classList.add("testing");
			document.getElementById("connectionStatus").classList.remove("valid");
			document.getElementById("connectionStatus").innerText = "Connection Status: Testing";
		} else {
			document.getElementById("connectionStatus").classList.add("valid");
			document.getElementById("connectionStatus").classList.remove("testing");
			document.getElementById("connectionStatus").innerText = "Connection Status: Connected";
		}


		//hide other connection options
		if (serialMode) {
			//serial
			document.getElementById("wifiControls").classList.add("hidden");
		} else {
			//wifi
			document.getElementById("serialControls").classList.add("hidden");
		}
	} else {
		document.getElementById("connectionStatus").classList.add("invalid");
		document.getElementById("connectionStatus").classList.remove("valid");
		document.getElementById("connectionStatus").classList.remove("testing");
		document.getElementById("connectionStatus").innerText = "Connection Status: Not Connected";


		//display all connection options
		document.getElementById("serialControls").classList.remove("hidden");
		document.getElementById("wifiControls").classList.remove("hidden");
	}

	//toggle menus since height may have changed
	toogleCollapsibleMenus();
	toogleCollapsibleMenus();
}

//displays if all changes are saved
function updateDataStatus() {
	if (loadedData.dirty) {
		document.getElementById("dataStatus").textContent = "Unsaved Changes";
		document.getElementById("dataStatus").classList.add("invalid");
		document.getElementById("dataStatus").classList.remove("valid");
	} else {
		document.getElementById("dataStatus").textContent = "All changes saved";
		document.getElementById("dataStatus").classList.add("valid");
		document.getElementById("dataStatus").classList.remove("invalid");
	}
}

function updateSendingStatus() {
	if (comLock) {
		document.getElementById("sendingStatus").textContent = "Sending/Receiving in progress";
		document.getElementById("sendingStatus").classList.add("testing");
		document.getElementById("sendingStatus").classList.remove("valid");
	} else {
		document.getElementById("sendingStatus").textContent = "Not Sending/Receiving";
		document.getElementById("sendingStatus").classList.add("valid");
		document.getElementById("sendingStatus").classList.remove("testing");
	}
}

//called when refresh button is pressed
function refreshDataClick() {
	if (!loadedData.dirty || confirm("This will lose any changes. Are you sure you want to refresh?") == true) {
		sendRefreshCommand();
	}
}

function applyChangesClick() {
	if (confirm("Are you sure you want to apply changes?") == true) {
		sendApplyChanges();
	}
}

//writes error to log, then throws it if true
function writeToErrorLog(message, throwError = true) {
	document.getElementById("errorLog").textContent += "\n" + message;

	if (throwError) {
		throw console.error(message);
	}
}

//clears error clog
function clearErrorLogClick() {
	document.getElementById("errorLog").textContent = "";
}

//#endregion


//#region Connection menu

//called when the dropdown for serial baud rate is changed
function setBaudRate() {
	baudRate.value = document.getElementById("baudSelect").value;
}

//#endregion

//#region General Settings
function refreshGeneralSettings() {
	document.getElementById("enableWifiToggle").checked = loadedData.generalSettings.wifiEnabled;
	document.getElementById("wifiNameInput").value = loadedData.generalSettings.wifiSSID;
	document.getElementById("wifiPassInput").value = loadedData.generalSettings.wifiPassword;
}

function enableWifiToggleClick() {
	loadedData.generalSettings.wifiEnabled = document.getElementById("enableWifiToggle").checked;
}

function wifiNameChanged() {
	loadedData.generalSettings.wifiSSID = document.getElementById("wifiNameInput").value;
}

function wifiPassChanged() {
	loadedData.generalSettings.wifiPassword = document.getElementById("wifiPassInput").value;
}

//#endregion


//#region Timeline methods

//used to create timelines

//build a time slot button
function createTimeSlotButton(currentCut, nextCut, isOn = false, clickFunc) {
	//validate args
	if (currentCut.hour === undefined) {
		currentCut.hour = 0;
	}

	if (currentCut.min === undefined) {
		currentCut.min = 0;
	}

	if (nextCut.hour === undefined) {
		nextCut.hour = 0;
	}

	if (nextCut.min === undefined) {
		nextCut.min = 0;
	}


	//create table data element
	let tableData = document.createElement("td");

	//create new button
	let newRelayButton = document.createElement("Button");

	//calculate time in minutes
	let startTime = (currentCut.hour * 60) + currentCut.min;
	let endTime = (nextCut.hour * 60) + nextCut.min;

	let styleWidth = ((endTime - startTime) / minutesInADay) * 100;
	let stylePosition = (startTime / minutesInADay) * 100;

	//set width
	// newRelayButton.style.width = styleWidth + "%";
	// newRelayButton.style.flex = styleWidth;
	// tableData.colSpan = styleWidth;
	tableData.style.width = styleWidth + "%";
	newRelayButton.style.width = "100%";

	//set position
	// newRelayButton.style.left = stylePosition + "%";

	//set color
	if (isOn) {
		newRelayButton.classList.add("valid");
	} else {
		newRelayButton.classList.add("invalid");
	}

	//add other formating
	if (styleWidth != 0) {
		tableData.style.padding = "0";

		newRelayButton.style.padding = "0";
		newRelayButton.style.border = "solid";
		newRelayButton.style.cursor = "pointer";
		newRelayButton.style.height = "30px";
		newRelayButton.style.borderColor = "black";
		newRelayButton.style.borderWidth = "1px";
	} else {
		tableData.style.display = "none";
		newRelayButton.style.display = "none";
	}

	//add on click function
	if (clickFunc !== undefined) {
		newRelayButton.addEventListener("click", clickFunc);
	}

	//add button to the table data
	tableData.appendChild(newRelayButton);

	return tableData;
}

//builds a time line marker
function createTimeLine(currentCut, nextCut) {
	//validate args
	if (currentCut.hour === undefined) {
		currentCut.hour = 0;
	}

	if (currentCut.min === undefined) {
		currentCut.min = 0;
	}

	if (nextCut.hour === undefined) {
		nextCut.hour = 0;
	}

	if (nextCut.min === undefined) {
		nextCut.min = 0;
	}

	//create table data element
	let tableData = document.createElement("td");

	//create div
	let timeLineDiv = document.createElement("div");

	//calculate time
	let startTime = (currentCut.hour * 60) + currentCut.min;
	let endTime = (nextCut.hour * 60) + nextCut.min;
	let styleWidth = ((endTime - startTime) / minutesInADay) * 100;

	//fix overflows with minutes
	while (currentCut.min >= 60) {
		currentCut.min -= 60;
		currentCut.hour += 1;
	}

	//set text
	timeLineDiv.textContent = String(currentCut.hour).padStart(2, "0") + ":" + String(currentCut.min).padStart(2, "0");

	//set width
	tableData.style.width = styleWidth + "%";
	timeLineDiv.style.width = "100%";

	//add other formating
	if (styleWidth != 0) {
		tableData.style.padding = "0";

		timeLineDiv.style.border = "solid";
		timeLineDiv.style.cursor = "pointer";
		// timeLineDiv.style.height = "30px";
		timeLineDiv.style.borderColor = "black";
		timeLineDiv.style.borderWidth = "1px";
	} else {
		tableData.style.display = "none";
		timeLineDiv.style.display = "none";
	}

	//add div to the table data
	tableData.appendChild(timeLineDiv);

	return tableData;
}

//#endregion

function refreshUI() {
	//refresh time slot menu
	refreshTimeSlotUI();

	//refresh the holiday menu
	refreshHolidayUI();

	//refresh the general settings menu
	refreshGeneralSettings();

	//refresh procedures
	refreshProcedureUi();

	//toggle menus since height may have changed
	toogleCollapsibleMenus();
	toogleCollapsibleMenus();
}