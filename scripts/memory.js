"use strict";

//this stores and handles memory

//constants provided from arduino
let maxProcedureCuts = 99;
let maxCutsPerDay = 99;
let maxHolidays = 99;

//#region memory templates
//these classes represent the json sent by the arduino

function ProcedureCut(_min, _relayOn) {
	var privateMin;
	var privateRelayOn = 0;

	// Create getters and setters
	Object.defineProperty(this, "min", {
		get: function () {
			return privateMin;
		},
		set: function (_min) {
			privateMin = _min;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "relayOn", {
		get: function () {
			return privateRelayOn;
		},
		set: function (_relayOn) {
			privateRelayOn = _relayOn;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	this.getRelayOn = function(relayIndex)
	{
		// create mask
		let mask = createBitMask(1, relayIndex);

		// check mask and return value
		return (privateRelayOn & mask) != 0;
	}

	//validate and apply args
	if (_min !== undefined) {
		privateMin = _min;

		//mark data dirty
		loadedData.dirty = true;
	}

	if (_relayOn !== undefined) {
		privateRelayOn = _relayOn;

		//mark data dirty
		loadedData.dirty = true;
	}

	this.toJSON = function () {
		return {
			min: privateMin,
			relayOn: privateRelayOn
		}
	}
}

function Procedure() {
	var privateDefaultRelayOn = 0;
	var privateUsedCuts = 0;
	var privateCutList = [new ProcedureCut()];

	// Create getters and setters
	Object.defineProperty(this, "defaultRelayOn", {
		get: function () {
			return privateDefaultRelayOn;
		},
		set: function (_defaultRelayOn) {
			privateDefaultRelayOn = _defaultRelayOn;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "usedCuts", {
		get: function () {
			return privateUsedCuts;
		},
		set: function (_usedCuts) {
			privateUsedCuts = _usedCuts;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "cutList", {
		get: function () {
			return privateCutList;
		},
		set: function (_cutList) {
			privateCutList = _cutList;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	this.toJSON = function () {
		return {
			defaultRelayOn: privateDefaultRelayOn,
			usedCuts: privateUsedCuts,
			cutList: privateCutList
		}
	}
}

function TimeCut(_hour, _min, isOn) {
	var privateHour = 0;
	var privateMin = 0;
	var privatePivotOn = false;

	// Create getters and setters
	Object.defineProperty(this, "hour", {
		get: function () {
			return privateHour;
		},
		set: function (_hour) {
			privateHour = _hour;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "min", {
		get: function () {
			return privateMin;
		},
		set: function (_min) {
			privateMin = _min;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "pivotOn", {
		get: function () {
			return privatePivotOn;
		},
		set: function (_pivotOn) {
			privatePivotOn = _pivotOn;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	//validate and apply args
	if (_hour !== undefined) {
		privateHour = _hour;

		//mark data dirty
		loadedData.dirty = true;
	}

	if (_min !== undefined) {
		privateMin = _min;

		//mark data dirty
		loadedData.dirty = true;
	}

	if (isOn !== undefined) {
		privatePivotOn = isOn;

		//mark data dirty
		loadedData.dirty = true;
	}

	this.toJSON = function(){
		return {
			hour: privateHour,
			min: privateMin
		}
	}
}

function WeekdayInfo() {
	//private
	var privateUsedCuts = 1;
	var privateCutList = [new TimeCut()];

	//define getters and setters
	Object.defineProperty(this, "usedCuts", {
		get: function () {
			return privateUsedCuts;
		},
		set: function (_usedCuts) {
			privateUsedCuts = _usedCuts;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "cutList", {
		get: function () {
			return privateCutList;
		},
		set: function (_cutList) {
			privateCutList = _cutList;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	this.toJSON = function () {
		//get pivotOn bool array
		let boolArray = [];
		for (var i = 0; i < privateCutList.length; i++) {
			boolArray.push(privateCutList[i].pivotOn)
		}

		//convert bool array to bytes array
		let byteArray = boolArrayToBytes(boolArray);

		//send values
		return {
			usedCuts: privateUsedCuts,
			cutList: privateCutList,
			pivotOnList: byteArray
		}
	}
}

function HolidaySlot() {
	var privatePivotOn = 0;

	var privateBeginHour = 0;
	var privateBeginMin = 0;
	var privateEndHour = 0;
	var privateEndMin = 0;

	//month of the holiday
	var privateHolidayMonthRestrict = 0;

	//set to -1 to ignore (speciic day)
	var privateDayRestrict = 0;

	//set to 0 to ignore (week of the month)
	var privateHolidayWeekRestrict = 0;
	var privateHolidayweekDayRestrict = 0;

	//define getters and setters

	Object.defineProperty(this, "pivotOn", {
		get: function () {
			return privatePivotOn;
		},
		set: function (_pivotOn) {
			privatePivotOn = _pivotOn;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "beginHour", {
		get: function () {
			return privateBeginHour;
		},
		set: function (_beginHour) {
			privateBeginHour = _beginHour;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "beginMin", {
		get: function () {
			return privateBeginMin;
		},
		set: function (_beginMin) {
			privateBeginMin = _beginMin;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "endHour", {
		get: function () {
			return privateEndHour;
		},
		set: function (_endHour) {
			privateEndHour = _endHour;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "endMin", {
		get: function () {
			return privateEndMin;
		},
		set: function (_endMin) {
			privateEndMin = _endMin;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "holidayMonthRestrict", {
		get: function () {
			return privateHolidayMonthRestrict;
		},
		set: function (_holidayMonthRestrict) {
			privateHolidayMonthRestrict = _holidayMonthRestrict;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "dayRestrict", {
		get: function () {
			return privateDayRestrict;
		},
		set: function (_dayRestrict) {
			privateDayRestrict = _dayRestrict;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "holidayWeekRestrict", {
		get: function () {
			return privateHolidayWeekRestrict;
		},
		set: function (_holidayWeekRestrict) {
			privateHolidayWeekRestrict = _holidayWeekRestrict;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "holidayweekDayRestrict", {
		get: function () {
			return privateHolidayweekDayRestrict;
		},
		set: function (_holidayweekDayRestrict) {
			privateHolidayweekDayRestrict = _holidayweekDayRestrict;

			//mark data dirty
			loadedData.dirty = true;
		}
	});
}

function HolidayStruct() {
	var privateUsedHolidaySlots = 0;
	var privateHolidayTimeSlots = [new HolidaySlot()];

	Object.defineProperty(this, "usedHolidaySlots", {
		get: function () {
			return privateUsedHolidaySlots;
		},
		set: function (_usedHolidaySlots) {
			privateUsedHolidaySlots = _usedHolidaySlots;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "holidayTimeSlots", {
		get: function () {
			return privateHolidayTimeSlots;
		},
		set: function (_holidayTimeSlots) {
			privateHolidayTimeSlots = _holidayTimeSlots;

			//mark data dirty
			loadedData.dirty = true;
		}
	});
}

function GeneralSettings() {
	var privateWifiEnabled = false;
	var privateWifiSSID = "";
	var privateWifiPassword = "";

	//define getters and setters

	Object.defineProperty(this, "wifiEnabled", {
		get: function () {
			return privateWifiEnabled;
		},
		set: function (_wifiEnabled) {
			privateWifiEnabled = _wifiEnabled;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "wifiSSID", {
		get: function () {
			return privateWifiSSID;
		},
		set: function (_wifiSSID) {
			privateWifiSSID = _wifiSSID;

			//mark data dirty
			loadedData.dirty = true;
		}
	});

	Object.defineProperty(this, "wifiPassword", {
		get: function () {
			return privateWifiPassword;
		},
		set: function (_wifiPassword) {
			privateWifiPassword = _wifiPassword;

			//mark data dirty
			loadedData.dirty = true;
		}
	});
}
//#endregion

//stores loaded info
function memory() {
	var privateWeekDayInfo = [new WeekdayInfo(), new WeekdayInfo(), new WeekdayInfo(), new WeekdayInfo(), new WeekdayInfo(), new WeekdayInfo(), new WeekdayInfo()];
	var privateHolidayInfo = new HolidayStruct;

	var privateStartProcedure = new Procedure();
	var privateStopProcedure = new Procedure();

	var privateGeneralSettings = new GeneralSettings();
	var privateDirty = true;

	Object.defineProperty(this, "weekDayInfo", {
		get: function () {
			return privateWeekDayInfo;
		},
		set: function (_weekDayInfo) {
			privateWeekDayInfo = _weekDayInfo;

			//mark data dirty
			this.dirty = true;
		}
	});

	Object.defineProperty(this, "holidayInfo", {
		get: function () {
			return privateHolidayInfo;
		},
		set: function (_holidayInfo) {
			privateHolidayInfo = _holidayInfo;

			//mark data dirty
			this.dirty = true;
		}
	});

	Object.defineProperty(this, "startProcedure", {
		get: function () {
			return privateStartProcedure;
		},
		set: function (_startProcedure) {
			privateStartProcedure = _startProcedure;

			//mark data dirty
			this.dirty = true;
		}
	});

	Object.defineProperty(this, "stopProcedure", {
		get: function () {
			return privateStopProcedure;
		},
		set: function (_stopProcedure) {
			privateStopProcedure = _stopProcedure;

			//mark data dirty
			this.dirty = true;
		}
	});

	Object.defineProperty(this, "generalSettings", {
		get: function () {
			return privateGeneralSettings;
		},
		set: function (_generalSettings) {
			privateGeneralSettings = _generalSettings;

			//mark data dirty
			this.dirty = true;
		}
	});

	Object.defineProperty(this, "dirty", {
		get: function () {
			return privateDirty;
		},
		set: function (_dirty) {
			privateDirty = _dirty;

			//update ui
			updateDataStatus();
		}
	});
}
var loadedData = new memory();

//add methods for handling the presented data
WeekdayInfo.prototype.sortList = function () {
	this.cutList.sort(function (a, b) {
		let aTime = (a.hour * 60) + a.min;
		let bTime = (b.hour * 60) + b.min;

		if (aTime < bTime) {
			return -1;
		}
		if (aTime > bTime) {
			return 1;
		}
		return 0;
	});
}

//adds a new time cut
WeekdayInfo.prototype.addTimeCut = function (hour, min, pivotOn = false) {
	//check if cut already exists
	for (let i = 0; i < this.cutList.length; i++) {
		if (this.cutList[i].hour == hour) {
			if (this.cutList[i].min == min) {
				//already exists
				return;
			}
		}
	}

	//check if we reached the maximum cuts in one day
	if (this.usedCuts >= maxCutsPerDay) {
		writeToErrorLog("Max Cuts for one day", false);
		return;
	}

	//add to the array
	if (this.cutList.length <= this.usedCuts) {
		this.cutList.push(new TimeCut(hour, min, pivotOn));
	} else {
		this.cutList[this.usedCuts] = new TimeCut(hour, min, pivotOn);
	}

	//increment cut counter
	this.usedCuts++;

	//sort the list after adding
	loadedData.weekDayInfo[selectedWeekDay.value].sortList();
}

WeekdayInfo.prototype.removeTimeCut = function (index) {
	//remove the cut
	this.cutList.splice(index, 1);

	//decrement counter
	this.usedCuts--;

	//mark data dirty
	loadedData.dirty = true;
}

HolidayStruct.prototype.addHoliday = function () {
	//check if we reached the maximum cuts in one day
	if (this.usedHolidaySlots >= maxHolidays) {
		writeToErrorLog("Max Holidays", false);
		return;
	}

	//add to the array
	if (this.holidayTimeSlots.length <= this.usedHolidaySlots) {
		this.holidayTimeSlots.push(new HolidaySlot());
	} else {
		this.holidayTimeSlots[this.usedHolidaySlots] = new HolidaySlot();
	}

	//increment counter
	this.usedHolidaySlots++;
}

HolidayStruct.prototype.removeHoliday = function (index) {
	//validate args
	if (index === undefined || index < 0 || index > this.usedHolidaySlots) {
		//invalid index
		return;
	}

	//remove the slot
	this.holidayTimeSlots.splice(index, 1);

	//decrement the counter
	this.usedHolidaySlots--;
}


Procedure.prototype.sortList = function () {
	this.cutList.sort(function (a, b) {
		let aTime = a.min;
		let bTime = b.min;

		if (aTime < bTime) {
			return -1;
		}
		if (aTime > bTime) {
			return 1;
		}
		return 0;
	});
}

//adds a new time cut
Procedure.prototype.addProcedureCut = function (min, relayOn = 0) {
	//check if cut already exists
	for (let i = 0; i < this.cutList.length; i++) {
		if (this.cutList[i].min == min) {
			//already exists
			return;
		}
	}

	//check if we reached the maximum cuts in one day
	if (this.usedCuts >= maxProcedureCuts) {
		writeToErrorLog("Max cuts for one procedure", false);
		return;
	}

	//add to the array
	if (this.cutList.length <= this.usedCuts) {
		this.cutList.push(new ProcedureCut(min, relayOn));
	} else {
		this.cutList[this.usedCuts] = new ProcedureCut(min, relayOn);
	}

	//increment cut counter
	this.usedCuts++;

	//sort the list after adding
	this.sortList();
}

Procedure.prototype.removeProcedureCut = function (index) {
	//remove the cut
	this.cutList.splice(index, 1);

	//decrement counter
	this.usedCuts--;

	//mark data dirty
	loadedData.dirty = true;
}