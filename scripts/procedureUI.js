"use strict";

function refreshProcedureUi() {
	//display max cuts in one day
	let elements = document.getElementsByClassName("maxProcedureCuts");
	for (var i = 0; i < elements.length; i++) {
		elements[i].textContent = maxProcedureCuts;
	}

	refreshStartProcedureUI();

	refreshStopProcedureUI();
}

function refreshStartProcedureUI() {
	//setup relay controls
	let startRelayContainers = document.getElementById("startRelayContainers");
	let startRelayTables = [];

	//get all the relay tables
	for (var i = 0; i < 4; i++) {
		startRelayTables.push(startRelayContainers.children[i]);
	}

	//loop through all relays
	for (let i = 0; i < 4; i++) {

		//create timeline buttons
		//clear old elements
		startRelayTables[i].textContent = '';

		//create row for buttons
		let buttonRow = document.createElement("tr");

		//create rows for time lines
		let timeLineRow = document.createElement("tr");

		//check if this day has any cuts
		if (loadedData.startProcedure.usedCuts < 1) {
			//add default button
			buttonRow.appendChild(createTimeSlotButton(defaultTimeCut, endOfDayTimeCut, false, () => { defaultProcedureButtonClicked(0, i) }));

			timeLineRow.appendChild(createTimeLine(defaultTimeCut, endOfDayTimeCut));
		} else {
			//add default button
			buttonRow.appendChild(createTimeSlotButton(defaultTimeCut, loadedData.startProcedure.cutList[0], false, () => { defaultProcedureButtonClicked(0, i) }));

			//add timeline for default button
			timeLineRow.appendChild(createTimeLine(defaultTimeCut, loadedData.startProcedure.cutList[0]));

			//loop through each cut
			for (let j = 0; j < loadedData.startProcedure.usedCuts; j++) {
				//get info
				let curentCut = loadedData.startProcedure.cutList[j];

				//check for last button in each container
				var nextCut;
				if (j == loadedData.startProcedure.usedCuts - 1) {
					nextCut = endOfDayTimeCut;
				} else {
					nextCut = loadedData.startProcedure.cutList[j + 1];
				}

				//calculate if this button should be on
				let isOn = loadedData.startProcedure.cutList[j].getRelayOn(i);

				//create new button
				let newRelayButton = createTimeSlotButton(curentCut, nextCut, isOn, () => procedureButtonClicked(0, j, i));

				//add button
				buttonRow.appendChild(newRelayButton);

				//create matching timeline
				timeLineRow.appendChild(createTimeLine(curentCut, nextCut));
			}
		}

		//add button row to the table
		startRelayTables[i].appendChild(buttonRow);

		//add timeline row to the table
		startRelayTables[i].appendChild(timeLineRow);
	}

	//populate remove cut dropdown
	//get dropdown
	let removeDropDown = document.getElementById("removeStartCutSelect");

	//remove old options
	removeDropDown.textContent = '';

	//create new options
	for (let i = 0; i < loadedData.startProcedure.usedCuts; i++) {
		//create option
		var option = document.createElement("option");

		//get the current timeCut
		let cut = loadedData.startProcedure.cutList[i];

		//set dropdown value
		option.value = i;

		//set text
		option.text = String(cut.min).padStart(2, 0);

		//add option to dropdown
		removeDropDown.add(option);
	}
}

function refreshStopProcedureUI() {
	//setup relay controls
	let stopRelayContainers = document.getElementById("stopRelayContainers");
	let stopRelayTables = [];

	//get all the relay tables
	for (var i = 0; i < 4; i++) {
		stopRelayTables.push(stopRelayContainers.children[i]);
	}

	//loop through all relays
	for (let i = 0; i < 4; i++) {

		//create timeline buttons
		//clear old elements
		stopRelayTables[i].textContent = '';

		//create row for buttons
		let buttonRow = document.createElement("tr");

		//create rows for time lines
		let timeLineRow = document.createElement("tr");

		//check if this day has any cuts
		if (loadedData.stopProcedure.usedCuts < 1) {
			//add default button
			buttonRow.appendChild(createTimeSlotButton(defaultTimeCut, endOfDayTimeCut, false, () => { defaultProcedureButtonClicked(1, i) }));

			timeLineRow.appendChild(createTimeLine(defaultTimeCut, endOfDayTimeCut));
		} else {
			//add default button
			buttonRow.appendChild(createTimeSlotButton(defaultTimeCut, loadedData.stopProcedure.cutList[0], false, () => { defaultProcedureButtonClicked(1, i) }));

			//add timeline for default button
			timeLineRow.appendChild(createTimeLine(defaultTimeCut, loadedData.stopProcedure.cutList[0]));

			//loop through each cut
			for (let j = 0; j < loadedData.stopProcedure.usedCuts; j++) {
				//get info
				let curentCut = loadedData.stopProcedure.cutList[j];

				//check for last button in each container
				var nextCut;
				if (j == loadedData.stopProcedure.usedCuts - 1) {
					nextCut = endOfDayTimeCut;
				} else {
					nextCut = loadedData.stopProcedure.cutList[j + 1];
				}

				//calculate if this button should be on
				let isOn = loadedData.stopProcedure.cutList[j].getRelayOn(i);

				//create new button
				let newRelayButton = createTimeSlotButton(curentCut, nextCut, isOn, () => procedureButtonClicked(1, j, i));

				//add button
				buttonRow.appendChild(newRelayButton);

				//create matching timeline
				timeLineRow.appendChild(createTimeLine(curentCut, nextCut));
			}
		}

		//add button row to the table
		stopRelayTables[i].appendChild(buttonRow);

		//add timeline row to the table
		stopRelayTables[i].appendChild(timeLineRow);
	}

	//populate remove cut dropdown
	//get dropdown
	let removeDropDown = document.getElementById("removeStopCutSelect");

	//remove old options
	removeDropDown.textContent = '';

	//create new options
	for (let i = 0; i < loadedData.stopProcedure.usedCuts; i++) {
		//create option
		var option = document.createElement("option");

		//get the current timeCut
		let cut = loadedData.stopProcedure.cutList[i];

		//set dropdown value
		option.value = i;

		//set text
		option.text = String(cut.min).padStart(2, 0);

		//add option to dropdown
		removeDropDown.add(option);
	}
}

//called when a relay slot button is clicked
function procedureButtonClicked(procedureIndex, cutIndex, relayIndex) {
	//get saved value
	let savedPivotOn
	if (procedureIndex == 0) {
		savedPivotOn = loadedData.startProcedure.cutList[cutIndex].relayOn;
	} else if (procedureIndex == 1) {
		savedPivotOn = loadedData.stopProcedure.cutList[cutIndex].relayOn;
	}

	//create mask
	let mask = createBitMask(1, relayIndex);

	//invert value
	savedPivotOn ^= mask;

	//save it back
	if (procedureIndex == 0) {
		loadedData.startProcedure.cutList[cutIndex].relayOn = savedPivotOn;
	} else if (procedureIndex == 1) {
		loadedData.stopProcedure.cutList[cutIndex].relayOn = savedPivotOn;
	}

	//refresh ui
	refreshUI();
}

function defaultProcedureButtonClicked(procedureIndex, relayIndex) {
	//create mask
	let relayMask = createBitMask(1, relayIndex);

	//add the new cut
	if (procedureIndex == 0) {
		//start procedure
		loadedData.startProcedure.addProcedureCut(0, relayMask);
	} else if (procedureIndex == 1) {
		//stop procedure
		loadedData.stopProcedure.addProcedureCut(0, relayMask);
	}

	//refresh ui
	refreshUI();
}


function addProcedureCutClick(procedureIndex) {
	let newTime;
	if (procedureIndex == 0) {
		newTime = document.getElementById("addStartCutInput").value;
	} else if (procedureIndex == 1) {
		newTime = document.getElementById("addStopCutInput").value;
	}
	let min = parseInt(newTime);

	if (isNaN(min)) {
		//unable to parse time
		console.log("miuntes is nan");
		return;
	}

	if (procedureIndex == 0) {
		//add the new cut
		loadedData.startProcedure.addProcedureCut(min, 0);

		//clear input
		document.getElementById("addStartCutInput").value = '';
	} else if (procedureIndex == 1) {
		//add the new cut
		loadedData.stopProcedure.addProcedureCut(min, 0);

		//clear input
		document.getElementById("addStopCutInput").value = '';
	}

	//refresh ui
	refreshUI();
}

function removeProcedureCutClick(procedureIndex) {
	let selected;

	//get the dropdown
	if (procedureIndex == 0) {
		selected = parseInt(document.getElementById("removeStartCutSelect").value);
	} else if (procedureIndex == 1) {
		selected = parseInt(document.getElementById("removeStopCutSelect").value);
	}

	if (isNaN(selected)) {
		//unable to parse dropdown
		return;
	}

	//remove the cut
	if (procedureIndex == 0) {
		loadedData.startProcedure.removeProcedureCut(selected);
	} else if (procedureIndex == 1) {
		loadedData.stopProcedure.removeProcedureCut(selected);
	}

	//refresh ui
	refreshUI();
}