let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function toDecimal(num) {
	let result = 0;

	for (let i = 0 ; i < num.length ; i++) {
		let currentNum = characters.indexOf(num.charAt(i));
		result += currentNum * Math.pow(characters.length, num.length - 1 - i);
	}
	return result;
}

function toBase62(num) {
	let numLength = 1;
	let result = "";

	while (num / Math.pow(characters.length, numLength) >= 1) {
		numLength++;
	}
	
	for (let i = 0 ; i < numLength ; i++) {
		let indexNumInDecimal = Math.pow(characters.length, numLength - 1 - i);
		let charactersIndex = Math.trunc(num / indexNumInDecimal);
		let indexNum = characters.charAt(charactersIndex);

		result += indexNum;
		num -= indexNumInDecimal * charactersIndex;
	}
	return result;
}

function incrementNum(num) {
	return toBase62(toDecimal(num) + 1);
}

module.exports = {
	numbers 		: characters,
	toBase62 		: toBase62,
	toDecimal		: toDecimal,
	incrementNum	: incrementNum
};