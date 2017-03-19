const rp          = require('request-promise-native');
const parseString = require('xml2js').parseString;

function getTotalPosts(tags) {
  return new Promise((resolve, reject) => {
    search(tags)
      .then(getCount)
      .then(resolve)
      .catch(err => {
        console.log("Error - totalposts.js::function getTotalPosts(). This is probably an issue with the specified tags.", err);
      })
  });
}


function search(tags) {
  return new Promise((resolve, reject) => {
    var options = {
      uri: `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=${tags.join('+')}&limit=1`,
      headers: {'User-Agent': 'request-promise-native'}
    };

    resolve(rp(options)).catch(err => {console.log(err)});
  });
}


// total post count is only in XML API so we're converting to JSON first because I hate XML
function getCount(body) {
  return new Promise((resolve, reject) => {
    parseString(body, (err, res) => {
      if (res.posts.post == undefined) {
        reject(new Error("Error - totalposts.js::function getCount(). Body undefined."));
      }
      else {
        resolve(res.posts.$.count);
      }
    });
  });
}


module.exports.getTotalPosts = getTotalPosts;
