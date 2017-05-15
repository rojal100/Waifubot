const rp          = require('request-promise-native');
const parseString = require('xml2js').parseString;


function getCharacterName(tags) {
	return new Promise((resolve, reject) => {
		for (let tag of tags) {
			getTag(tag)
			.then(result => {return getTagType(result)})
			.then(tag => {
				if (tag.type == 4) {
					resolve(parseName(tag));
				}
			});
		}
	});
}


function getTag(tag) {
	return new Promise((resolve, reject) => {
		var options = {
		    uri: `http://gelbooru.com/index.php?page=dapi&s=tag&q=index&name=${tag}`,
		    headers: {'User-Agent': 'request-promise-native'}
		};

		resolve(rp(options)).catch(err => {console.log(err);});
	});
}


//Tag API doesn't support JSON so we're converting the XML to JSON here
function getTagType(body) {
	return new Promise((resolve, reject) => {
		parseString(body, (err, res) => {
			if (res.tags.tag[0] == undefined) {
				reject(new Error("charname.js::getTagType() -- Body undefined.\n"));
			}
			resolve(body = res.tags.tag[0].$)
		})
	});
}


//Remove underscores and capitalize letters
function parseName(tag) {
	let name = tag.name
	name = name.replace(/_/g, ' ');
	name = name.replace(/\b\w/g, l => l.toUpperCase());
	return name;
}

module.exports.getCharacterName = getCharacterName;
