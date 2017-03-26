const gelbooru   = require('./gelbooru.js');
const totalposts = require('./totalposts.js');
const charname   = require('./charname.js');
const aliasList  = require('../config/aliases.json');
const math       = require('mathjs');


async function deliverWaifu(tagList) {
  //replace aliases with proper tag
  for (let tag in tagList) {
    tagList[tag] = resolveAliases(tagList, tag) || tagList[tag];
  }

  //get total posts for set of tags
  var totalPosts = await totalposts.getTotalPosts(tagList)
                                   .catch(err => {console.log("\n", err)});
  if (!totalPosts) return 0;

  //generate random post number
  var pid = await math.randomInt(0, totalPosts - 1);
  if (pid > 1000) pid %= 1000;

  //get random image
  var image = await getRandomWaifu(tagList, pid)
                    .catch(err => {console.log("\nError - waifu.js::await getRandomWaifu()", err)});

  //get character name
  var name = await charname.getCharcterName(image[0].tags);

  //append character name
  image[0].name = name;

  console.log("Search tags: ", tagList, "\n");
  return image;
}


//search for random image
function getRandomWaifu(tagList, pid) {
  return new Promise((resolve, reject) => {
    gelbooru.search(tagList, pid)
            .then(resolve)
            .catch(err => {
              reject(err);
            })
  });
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
  *  so we split the message every 1800 chars to be safe*/
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
