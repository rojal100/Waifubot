const rp          = require('request-promise-native');
const parseString = require('xml2js').parseString;


function getCharcterName(tags) {
  return new Promise((resolve, reject) => {
    for (let tag of tags) {
      var body = getTag(tag);
      var parsed = body.then(result => {return getTagType(result)});
      parsed.then(parsed => {
        if (parsed.type == 4) {
          var name = parsed.name
          name = name.replace(/_/g, ' ');
          name = name.replace(/\b\w/g, l => l.toUpperCase());
          resolve(name)
        }
      });
    }
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


function getTagType(body) {
  return new Promise((resolve, reject) => {
    parseString(body, (err, res) => {
      resolve(body = res.tags.tag[0].$)
    })
  });
}


module.exports.getCharcterName = getCharcterName;
