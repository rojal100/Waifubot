const rp          = require('request-promise-native');
const parseString = require('xml2js').parseString;
const xmldoc      = require('xmldoc');


function search(tags=[], pid, limit=1) {
  return new Promise((resolve, reject) => {
    getPost(tags, pid, limit)
    .then(convertToJSON)
    .then(parseTags)
    .then(resolve)
    .catch(err => {console.log("(search)Error: getPost() failed! This can happen if there was a problem with the specified tags.")})
  });
}


function getPost(tags, pid=0, limit=1) {
  return new Promise((resolve, reject) => {
    var options = {
      uri: `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=${tags.join('+')}&limit=${limit}&pid=${pid}`,
      headers: {'User-Agent': 'request-promise-native'},
      json: true
    };

    resolve(rp(options)).catch(err => {console.log(err);});
  });
}


function getTag(tag) {
  return new Promise((resolve, reject) => {
    var options = {
      uri: `http://gelbooru.com/index.php?page=dapi&s=tag&q=index&name=${tag}`,
      headers: {'User-Agent': 'request-promise-native'},
      json: true
    };

    resolve(rp(options)).catch(err => {console.log(err);});
  });
}


function getTotalPosts(tags) {
  return new Promise((resolve, reject) => {
    getPost(tags)
      .then(getCount)
      .then(resolve)
      .catch(err => {
        console.log("(getTotalPosts)Error: getPost() failed! This can happen if there was a problem with the specified tags.")});
  });
}


function convertToJSON(body, query) {
  return new Promise((resolve, reject) => {
      parseString(body, (err, res) => {
        resolve(res.posts.post.map(values => {return values.$}));
      });
  });
}


function getCount(body, query) {
  return new Promise((resolve, reject) => {
      parseString(body, (err, res) => {
        resolve(res.posts.$.count);
      });
  });
}


function parseTags(images) {
  return new Promise((resolve, reject) => {
    for (let image in images) {
      images[image].tags = images[image].tags.split(' ');
      images[image].tags = images[image].tags.filter(tag => {return tag != '';});
    }

    resolve(images);
  })
}


module.exports.search        = search;
module.exports.getTotalPosts = getTotalPosts;
//module.exports.convertToJSON = convertToJSON;
