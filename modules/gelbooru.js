const rp = require('request-promise-native');
const parseString = require('xml2js').parseString;


function search(tags=[], pid, limit=1) {
  return new Promise((resolve, reject) => {
    getPost(tags, pid, limit)
    //.then(convertToJSON)
    .then(resolve)
    .catch(err => {console.log("(gelbooru.js)Error: getPost() failed!")})
  });
}


function getPost(tags, pid, limit) {
  return new Promise((resolve, reject) => {
    var options = {
      uri: `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=${tags.join('+')}&limit=${limit}&pid=${pid}&json=1`,
      headers: {'User-Agent': 'request-promise-native'},
      json: true
    };

    resolve(rp(options)).catch(err => {console.log(err);});
  })
}


// function convertToJSON(body) {
//   return new Promise((resolve, reject) => {
//     parseString(body, (err, res) => {
//       resolve(res.posts.post.map(values => {return values.$}))
//     });
//   });
// }


module.exports.search = search;
//module.exports.convertToJSON = convertToJSON;
