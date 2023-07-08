"use strict";

//sets a single bit to on or off
function setSingleBit(number, bitIndex, isOn) {
	//validate args
	isOn = !!isOn; //booleanize the value

	// create mask
	let bitMask = 1 << bitIndex;

	return number ^= ((-isOn ^ number) & bitMask);
}

function createBitMask(numBits, leastPosition) {
	
	let mask = (1 << numBits) - 1;
	return mask << leastPosition;
}