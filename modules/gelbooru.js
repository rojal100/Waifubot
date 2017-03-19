const rp          = require('request-promise-native');
const parseString = require('xml2js').parseString;


// search for a post with specified tags and random pid
function search(tags=[], pid) {
  return new Promise((resolve, reject) => {
    getPost(tags, pid)
    .then(parseTags)
    .then(resolve)
    .catch(err => {
      console.log("Error - gelbooru.js::function search()", err);
    })
  });
}


// send an html request to gelbooru for a specific post
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


// split tag list into an array of individual tags
function parseTags(image) {
  return new Promise((resolve, reject) => {
    if (image) {
      image[0].tags = image[0].tags.split(' ');
      image[0].tags = image[0].tags.filter(tag => {return tag != '';});
      resolve(image);
    }
    else {
      reject(new Error("Error - gelbooru.js::function parseTags(). image not defined."));
    }
  });
}


module.exports.search = search;
