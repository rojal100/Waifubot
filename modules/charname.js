const rp          = require('request-promise-native');
const parseString = require('xml2js').parseString;


function getCharcterName(tags) {
  return new Promise((resolve, reject) => {
    for (let tag of tags) {
      var body = getTag(tag);
      var tagType = body.then(result => {return getTagType(result)});

      var name = tagType.then(tag => {
        if (tag.type == 4) {
          resolve(parseName(tag));
        }
      });
    }
  });
}


function getTag(tag) {
  return new Promise((resolve, reject) => {
    var options = {
      uri: `http://gelbooru.com/index.php?page=dapi&s=tag&q=index&name=${tag}`,
      headers: {'User-Agent': 'request-promise-native'}
    };

    resolve(rp(options)).catch(err => {console.log(err);});
  });
}


// Tag API doesn't support JSON so we're converting the XML to JSON here
function getTagType(body) {
  return new Promise((resolve, reject) => {
    parseString(body, (err, res) => {
      resolve(body = res.tags.tag[0].$)
    })
  });
}


// Remove underscores and capitalize letters
function parseName(tag) {
  let name = tag.name
  name = name.replace(/_/g, ' ');
  name = name.replace(/\b\w/g, l => l.toUpperCase());
  return name;
}

module.exports.getCharcterName = getCharcterName;
