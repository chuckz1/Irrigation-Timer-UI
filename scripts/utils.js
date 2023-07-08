"use strict";

//adds a string format command
if (!String.format) {
	String.format = function (format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] != 'undefined'
				? args[number]
				: match
				;
		});
	};
}

//used to sort objects based on properties
//e.g. People.sort(dynamicSortMultiple("Name", "-Surname"));
function dynamicSortMultiple() {
	/*
	 * save the arguments object as it will be overwritten
	 * note that arguments object is an array-like object
	 * consisting of the names of the properties to sort by
	 */
	var props = arguments;
	return function (obj1, obj2) {
		var i = 0, result = 0, numberOfProperties = props.length;
		/* try getting a different result from 0 (equal)
		 * as long as we have extra properties to compare
		 */
		while (result === 0 && i < numberOfProperties) {
			result = dynamicSort(props[i])(obj1, obj2);
			i++;
		}
		return result;
	}
}

//async delay method
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function boolArrayToBytes(boolArray = []) {
	let byteArray = [];

	let counter = 0;
	let newByte = 0;

	for (var i = 0; i < boolArray.length; i++) {
		//create mask
		let mask = createBitMask((boolArray[i] == true), counter);

		newByte += mask;

		counter++;
		if (counter >= 8) {
			byteArray.push(newByte);
			newByte = 0;
			counter = 0;
		}
	}

	//push extra byte at the end
	if (counter != 0) {
		byteArray.push(newByte);
	}

	return byteArray;
}

function bytesToBoolArray(byteArray = []) {
	let boolArray = [];

	for (var i = 0; i < byteArray.length; i++) {
		for (var j = 0; j < 8; j++) {
			//create mask
			let mask = createBitMask(1, j);

			let result = (byteArray[i] & mask) != 0;
			boolArray.push(result);
		}
	}

	return boolArray;
}