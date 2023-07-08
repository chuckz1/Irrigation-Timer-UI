"use strict";

//all the user interface code for setting the time slots

//global values
const weekDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let selectedWeekDay = document.getElementById("weekDaySelect");
let selectedCopyDay = -1;
const minutesInADay = 1440;
const defaultTimeCut = new TimeCut(0, 0);
const endOfDayTimeCut = new TimeCut(24, 0);

function refreshTimeSlotUI() {

	//set title
	document.getElementById("weekDayTitle").innerHTML = weekDayNames[selectedWeekDay.value];

	//display max cuts in one day
	document.getElementById("displayMaxDayCuts").textContent = maxCutsPerDay;

	//setup relay controls
	let pivotOnContainer = document.getElementById("pivotOnContainer");

	//create timeline buttons
	//clear old elements
	pivotOnContainer.textContent = '';

	//create row for buttons
	let buttonRow = document.createElement("tr");

	//create rows for time lines
	let timeLineRow = document.createElement("tr");

	//check if this day has any cuts
	if (loadedData.weekDayInfo[selectedWeekDay.value].usedCuts < 1) {
		//add default button
		buttonRow.appendChild(createTimeSlotButton(defaultTimeCut, endOfDayTimeCut, false, () => { defaultSlotButtonClicked() }));

		timeLineRow.appendChild(createTimeLine(defaultTimeCut, endOfDayTimeCut));
	} else {
		//add default button
		buttonRow.appendChild(createTimeSlotButton(defaultTimeCut, loadedData.weekDayInfo[selectedWeekDay.value].cutList[0], false, () => { defaultSlotButtonClicked() }));

		//add timeline for default button
		timeLineRow.appendChild(createTimeLine(defaultTimeCut, loadedData.weekDayInfo[selectedWeekDay.value].cutList[0]));

		//loop through each cut
		for (let i = 0; i < loadedData.weekDayInfo[selectedWeekDay.value].usedCuts; i++) {
			//get info
			let curentCut = loadedData.weekDayInfo[selectedWeekDay.value].cutList[i];

			//check for last button in each container
			var nextCut;
			if (i == loadedData.weekDayInfo[selectedWeekDay.value].usedCuts - 1) {
				nextCut = endOfDayTimeCut;
			} else {
				nextCut = loadedData.weekDayInfo[selectedWeekDay.value].cutList[i + 1];
			}

			//calculate if this button should be on
			let isOn = loadedData.weekDayInfo[selectedWeekDay.value].cutList[i].pivotOn;

			//create new button
			let newRelayButton = createTimeSlotButton(curentCut, nextCut, isOn, () => slotButtonClicked(i));

			//add button
			buttonRow.appendChild(newRelayButton);

			//create matching timeline
			timeLineRow.appendChild(createTimeLine(curentCut, nextCut));
		}
	}

	//add button row to the table
	pivotOnContainer.appendChild(buttonRow);

	//add timeline row to the table
	pivotOnContainer.appendChild(timeLineRow);

	//populate remove cut dropdown

	//get dropdown
	let removeDropDown = document.getElementById("removeCutSelect");

	//remove old options
	removeDropDown.textContent = '';

	//create new options
	for (let i = 0; i < loadedData.weekDayInfo[selectedWeekDay.value].usedCuts; i++) {
		//create option
		var option = document.createElement("option");

		//get the current timeCut
		let cut = loadedData.weekDayInfo[selectedWeekDay.value].cutList[i];

		//set dropdown value
		option.value = i;

		//set text
		option.text = String(cut.hour).padStart(2, "0") + ":" + String(cut.min).padStart(2, "0");

		//add option to dropdown
		removeDropDown.add(option);
	}
}


//called when a relay slot button is clicked
function slotButtonClicked(index) {
	//get saved value
	let savedPivotOn = loadedData.weekDayInfo[selectedWeekDay.value].cutList[index].pivotOn;

	//invert value
	savedPivotOn = (savedPivotOn != true);

	//save it back
	loadedData.weekDayInfo[selectedWeekDay.value].cutList[index].pivotOn = savedPivotOn;

	//refresh ui
	refreshUI();
}

//called when a default relay slot button (not tied to a specific slot) is clicked
function defaultSlotButtonClicked() {
	//create mask
	let relayMask = 1 << 0;

	//add the new cut
	loadedData.weekDayInfo[selectedWeekDay.value].addTimeCut(0, 0, relayMask);

	//refresh ui
	refreshUI();
}

function addTimeCutClick() {
	let newTime = document.getElementById("addCutInput").value.split(":");
	let hour = parseInt(newTime[0]);
	let min = parseInt(newTime[1]);

	if (isNaN(hour) || isNaN(min)) {
		//unable to parse time
		return;
	}

	//add the new cut
	loadedData.weekDayInfo[selectedWeekDay.value].addTimeCut(hour, min);

	//clear input
	document.getElementById("addCutInput").value = '';

	//refresh ui
	refreshUI();
}

function removeTimeCutClick() {
	//get the dropdown
	let selected = parseInt(document.getElementById("removeCutSelect").value);

	if (isNaN(selected)) {
		//unable to parse dropdown
		return;
	}

	//remove the cut
	loadedData.weekDayInfo[selectedWeekDay.value].removeTimeCut(selected);

	//refresh ui
	refreshUI();
}

function copyDayClick() {
	//save copy day
	selectedCopyDay = parseInt(selectedWeekDay.value);

	//enable paste button
	document.getElementById("pasteDayBtn").disabled = false;

	//update displayed info
	document.getElementById("selectedDayOutput").textContent = weekDayNames[selectedCopyDay];
}

function pasteDayClick() {
	if (selectedCopyDay >= 0) {
		//paste the day
		loadedData.weekDayInfo[selectedWeekDay.value] = loadedData.weekDayInfo[selectedCopyDay];

		//refresh ui
		refreshUI();
	}
}