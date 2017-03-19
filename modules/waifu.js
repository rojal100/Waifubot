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
                                   .catch(err => {console.log("Error - waifu.js::await totalposts.getTotalPosts()", err)});

  //generate random post number
  var pid = await math.randomInt(0, totalPosts - 1);

  //get random image
  var image = await getRandomWaifu(tagList, pid)
                    .catch(err => {console.log("Error - waifu.js::await getRandomWaifu()", err)});

  //get character name
  var name = await charname.getCharcterName(image[0].tags);

  //append character name
  image[0].name = name;

  console.log("\nSearch tags:", tagList);
  return image;
}


// search for random image
function getRandomWaifu(tagList, pid) {
  return new Promise((resolve, reject) => {
    gelbooru.search(tagList, pid)
            .then(resolve)
            .catch(err => {
              console.log(err);
            })
  });
}


// check each entry in tag list against alias list
function resolveAliases(tagList, tag) {
  for (let entry in aliasList) {
    if (aliasList[entry].aliases.includes(tagList[tag].toLowerCase())) {
      return entry;
    }
  }

  return false;
}


module.exports.deliverWaifu = deliverWaifu;
