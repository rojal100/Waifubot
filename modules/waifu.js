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
                                 .catch(err => {console.log("(waifu.js)Error: getTotalPosts() failed!")});
  //generate random post number
  var pid = await math.randomInt(1, totalPosts);
  //get random image
  var images = await getRandomWaifu(tagList, pid)
                    .catch(err => {console.log("(waifu.js)Error: getRandomWaifu() failed!")});
  //get character name
  var name = await charname.getCharcterName(images[0].tags);

  //append character name for every image
  for(let image in images) {
    images[image].name = name;
  }

  console.log("\n", tagList)
  return images;
}


// search for random image
function getRandomWaifu(tagList, pid) {
  return new Promise((resolve, reject) => {
    gelbooru.search(tagList, pid)
            .then(resolve)
            .catch(err => {
              console.log(err);
            })
  })
}


// check each entry in tag list against alias list
function resolveAliases(tagList, tag) {
  for (let entry in aliasList) {
    if (aliasList[entry].aliases.includes(tagList[tag].toLowerCase())) {
      return entry
    }
  }

  return false
}


module.exports.deliverWaifu = deliverWaifu;
