"use strict";

//all the user interface code for settings the holiday slots
let selectedHolidaySlot = 0;
let holidaySlotInputBox = document.getElementById("holidaySlotInput");
function refreshHolidayUI() {
	let container = document.getElementById("holidayCloneContainer");

	//display max holidays
	document.getElementById("displayMaxHolidays").textContent = maxHolidays;

	//update visual count
	let pageIndex;
	if (loadedData.holidayInfo.usedHolidaySlots == 0) {
		pageIndex = 0;
	} else {
		pageIndex = selectedHolidaySlot + 1;
	}
	document.getElementById("holidaySlotCountInfo").textContent = pageIndex + " of " + loadedData.holidayInfo.usedHolidaySlots;

	if (loadedData.holidayInfo.usedHolidaySlots == 0) {
		//hide holidays since there are no slots
		document.getElementById("individualHolidayContainer").style.display = "none";

		//set input box 
		holidaySlotInputBox.value = 0;
	} else {
		// display the selected holiday slot

		//get reference to the data
		let selectedData = loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot];

		//unhide the container
		document.getElementById("individualHolidayContainer").style.display = "block";

		//display slot index input box value
		holidaySlotInputBox.value = selectedHolidaySlot + 1;

		//display start & end time
		document.getElementById("holidayStartTimeInput").value = String(selectedData.beginHour).padStart(2, "0") + ":" + String(selectedData.beginMin).padStart(2, "0");
		document.getElementById("holidayEndTimeInput").value = String(selectedData.endHour).padStart(2, "0") + ":" + String(selectedData.endMin).padStart(2, "0");

		//display relay statuses
		let pivotOnButton = document.getElementById("holidayPivotOnButton");

		//apply value
		if (selectedData.pivotOn) {
			pivotOnButton.classList.add("valid");
			pivotOnButton.classList.remove("invalid");
		} else {
			pivotOnButton.classList.add("invalid");
			pivotOnButton.classList.remove("valid");
		}

		//display holiday type
		let specficDateContainer = document.getElementById("holidaySpecificDateContainer");
		let weekOfMonthContainer = document.getElementById("holidayWeekOfMonthContainer");
		if (selectedData.holidayWeekRestrict == 0) {
			//specific date

			//set form selected value
			document.getElementById("holidayTypeSelect1").checked = true;

			//hide/show menus
			specficDateContainer.style.display = "block";
			weekOfMonthContainer.style.display = "none";

			//set the selected date
			let monthString = String((selectedData.holidayMonthRestrict + 1)).padStart(2, "0");
			let dayString = String((selectedData.dayRestrict + 1)).padStart(2, "0");
			document.getElementById("holidaySpecificDateInput").value = new Date().getFullYear() + "-" + (monthString) + "-" + (dayString);
		} else {
			//week of the month

			//set form selected value
			document.getElementById("holidayTypeSelect2").checked = true;

			//hide/show menus
			specficDateContainer.style.display = "none";
			weekOfMonthContainer.style.display = "block";

			//set drop downs
			document.getElementById("holidayWeekNumInput").value = selectedData.holidayWeekRestrict;
			document.getElementById("holidayWeekDayInput").value = selectedData.holidayweekDayRestrict;
			document.getElementById("holidayMonthInput").value = selectedData.holidayMonthRestrict;
		}
	}
}

//called when number inside input box is changed
function holidaySlotChange() {
	let inputBox = document.getElementById("holidaySlotInput");
	let newValue = parseInt(inputBox.value);

	if (isNaN(newValue) || (newValue - 1) < 0 || (newValue - 1) > loadedData.holidayInfo.usedHolidaySlots) {
		//invalid slot index

		//revert value
		inputBox.value = selectedHolidaySlot + 1;
	} else {
		//save the new value
		selectedHolidaySlot = newValue - 1;
	}
}

//called when buttons are clicked
function changeHolidaySlotClick(changeAmount) {
	//apply change
	selectedHolidaySlot += changeAmount;

	//wrap value if it went too far
	if (selectedHolidaySlot < 0) {
		selectedHolidaySlot += loadedData.holidayInfo.usedHolidaySlots;
	} else if (selectedHolidaySlot >= loadedData.holidayInfo.usedHolidaySlots) {
		selectedHolidaySlot -= loadedData.holidayInfo.usedHolidaySlots;
	}

	//trim execess values
	if (selectedHolidaySlot < 0) {
		selectedHolidaySlot = 0;
	} else if (selectedHolidaySlot > loadedData.holidayInfo.usedHolidaySlots) {
		selectedHolidaySlot = Math.max(loadedData.holidayInfo.usedHolidaySlots - 1, 0);
	}

	//refresh ui
	refreshUI();
}

function addHolidaySlotClick() {
	//add to memory
	loadedData.holidayInfo.addHoliday();

	//update selected holiday to the new holiday
	selectedHolidaySlot = loadedData.holidayInfo.usedHolidaySlots - 1;

	refreshUI();
}

function removeHolidaySlotClick() {
	loadedData.holidayInfo.removeHoliday(selectedHolidaySlot);

	//set to a valid holiday slot
	selectedHolidaySlot = 0;

	refreshUI();
}

function HolidayTypeSelectChange() {
	var selectedType = new FormData(document.getElementById("holidayTypeForm")).get("typeSelect");

	if (selectedType == 0) {
		//specific date
		loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].holidayWeekRestrict = 0;
	} else if (selectedType == 1) {
		//week of the month
		loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].holidayWeekRestrict = 1;
	}

	//refresh ui
	refreshUI();
}

function holidayStartTimeChange() {
	let time = document.getElementById("holidayStartTimeInput").value.split(":");

	loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].beginHour = parseInt(time[0]);
	loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].beginMin = parseInt(time[1]);

	//refresh ui
	refreshUI();
}

function holidayEndTimeChange() {
	let time = document.getElementById("holidayEndTimeInput").value.split(":");

	loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].endHour = parseInt(time[0]);
	loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].endMin = parseInt(time[1]);

	//refresh ui
	refreshUI();
}

function holidayRelayToggle() {
	//get saved value
	let savedRelay = loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].pivotOn;

	//invert
	savedRelay = !savedRelay;

	//save it back
	loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].pivotOn = savedRelay;

	//refresh ui
	refreshUI();
}

function holidaySpecificDayChange() {
	let value = document.getElementById("holidaySpecificDateInput").value.split("-");

	//set month
	loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].holidayMonthRestrict = value[1] - 1;

	//set day
	loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].dayRestrict = value[2] - 1;
}

function holidayWeekNumChange() {
	loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].holidayWeekRestrict = parseInt(document.getElementById("holidayWeekNumInput").value);
}

function holidayWeekDayChange() {
	loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].holidayweekDayRestrict = parseInt(document.getElementById("holidayWeekDayInput").value);
}

function holidayMonthDropdownChange() {
	loadedData.holidayInfo.holidayTimeSlots[selectedHolidaySlot].holidayMonthRestrict = parseInt(document.getElementById("holidayMonthInput").value);
}