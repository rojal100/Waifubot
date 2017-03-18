const gelbooru   = require('./gelbooru.js');
//const booruTotal = require('./totalposts.js');
const aliasList  = require('../config/aliases.json');
const math       = require('mathjs');


async function deliverWaifu(tagList) {
  //replace aliases with proper tag
  for (let tag in tagList) {
    tagList[tag] = resolveAliases(tagList, tag) || tagList[tag];
  }

  //get total posts for set of tags
  var totalPosts = await gelbooru.getTotalPosts(tagList)
                                 .catch(err => {console.log("(waifu.js)Error: getTotalPosts() failed!")});
  //generate random post number
  var pid = await math.randomInt(1, totalPosts);
  //get random image
  var image = await getRandomWaifu(tagList, pid)
                    .catch(err => {console.log("(waifu.js)Error: getRandomWaifu() failed!")});

  console.log("\n", tagList)
  return image;
}


function getRandomWaifu(tagList, pid) {
  return new Promise((resolve, reject) => {
    //search for random image
    gelbooru.search(tagList, pid)
         .then(resolve)
         .catch(err => {
             console.log(err);
         })
  })
}


function resolveAliases(tagList, tag) {
  //check each entry in tag list against alias list
  for (let entry in aliasList) {
    if (aliasList[entry].aliases.includes(tagList[tag].toLowerCase())) {
      return entry
    }
  }

  return false
}


module.exports.deliverWaifu = deliverWaifu;
