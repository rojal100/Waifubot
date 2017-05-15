const gelbooru   = require('./gelbooru.js');
const totalPosts = require('./totalPosts.js');
const charName   = require('./charName.js');
const aliasList  = require('../config/aliases.json');
const math       = require('mathjs');


async function deliverWaifu(tagList) {
	//replace aliases with proper tag
	for (let tag in tagList) {
		tagList[tag] = resolveAliases(tagList, tag) || tagList[tag];
	}

	//get total posts for specified tags
	var total = await totalPosts.getTotalPosts(tagList)
															.catch(err => {console.log("\n", err)});
	if (!total) return;

	/* generate random post number, limited to 1000 because
	*  gelbooru is much slower to return older posts */
	var pid = await math.randomInt(0, total - 1) % 1000;

	//get image with random offset
	var image = await gelbooru.search(tagList, pid);

	//get character name and append to image object
	image.name = await charName.getCharacterName(image.tags);

	return image;
}


//check each entry in tag list against alias list
function resolveAliases(tagList, tag) {
	for (let entry in aliasList) {
		if (aliasList[entry].aliases.includes(tagList[tag].toLowerCase())) {
			return entry;
		}
	}

	return false;
}


function stringifyAliases() {
	var stringList = [];
	var longString = "";

	//convert alias list to Discord friendly format
	for (let entry in aliasList) {
		longString += ("```\n" + "Tag: " + entry + "\nAliases: " + aliasList[entry].aliases + "\n```\n");
	}

	/* Discord has a message char limit of 2000,
	*  so we split the message every 1800 chars to be safe */
	for (n = 0; n <= math.floor(longString.length / 1800); ++n) {
		let sliceBegin = longString.indexOf("```\nTag", n*1800);
		let sliceEnd = longString.indexOf("```\nTag", (n+1)*1800);
		if (sliceEnd == -1) {
			sliceEnd = longString.length - 1; //indexOf will return -1 if the start index exceeds the string length
		}
		stringList[n] = longString.slice(sliceBegin, sliceEnd);
	}

	return stringList;
}


module.exports.deliverWaifu     = deliverWaifu;
module.exports.stringifyAliases = stringifyAliases;
