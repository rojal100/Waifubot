const rp          = require('request-promise-native');
const parseString = require('xml2js').parseString;
const entities    = require('entities');


//search for a post with specified tags and random pid
function search(tags=[], pid) {
  return new Promise((resolve, reject) => {
    getPost(tags, pid)
    .then(parseTags)
    .then(resolve)
    .catch(err => {
      reject(err);
    })
  });
}


//send an html request to gelbooru for a specific post
function getPost(tags, pid) {
  return new Promise((resolve, reject) => {
    var options = {
      uri: `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=${tags.join('+')}&limit=1&pid=${pid}&json=1`,
      headers: {'User-Agent': 'request-promise-native'},
      json: true
    };

    resolve(rp(options)).catch(err => {console.log(err);});
  });
}


//split tag list into an array of individual tags
function parseTags(image) {
  return new Promise((resolve, reject) => {
    if (image) {
      image[0].tags = image[0].tags.split(' ');
      image[0].tags = image[0].tags.filter(tag => {return tag != '';});
      for (let tag in image[0].tags) {
        image[0].tags[tag] = entities.decodeHTML(image[0].tags[tag]);
      }
      resolve(image);
    }
    else {
      reject(new Error("gelbooru.js::parseTags() -- image not defined.\n"));
    }
  });
}


module.exports.search = search;
