const Discord  = require('discord.js');
const fs       = require('fs');
const waifu    = require('./modules/waifu.js');
const oauth2   = require('./config/oauth2.json');
const baseTags = require('./config/basetags.json').tags;
const client   = new Discord.Client();

if (fs.existsSync('./config/settings.json')) {
  var settings   = require('./config/settings.json');
} else {
  fs.writeFileSync('./config/settings.json', JSON.stringify({}), 'utf8', function(err) {
    if (err) throw err});
  var settings   = require('./config/settings.json');
}


//Ready notification
client.on('ready', () => {
  console.log("Ready! Connected to " + client.guilds.array().length + " servers");
  client.user.setGame("@" + client.user.username + " help");
});


/************************
*       FUNCTIONS       *
************************/
function toggleNSFW(message, setting) {
  if (!message.member) {
    message.reply("Cannot change settings. This is not a server.");
    return;
  }

  if (message.member.hasPermission("MANAGE_GUILD")) {
    var server = message.guild.id;

    if (!settings[server]) {
      settings[server] = {};
      settings[server]['NSFW'] = setting;
    }
    else {
      settings[server].NSFW = setting;
    }

    var json = JSON.stringify(settings, null, "\t");
    fs.writeFile('./config/settings.json', json, 'utf8', function(err) {
      if (err) throw err});

    console.log("Server: " + message.guild.name + " - " + message.guild.id + "\nNSFW: " + setting + "\n");
  }
  else {
    message.reply("You don't have the required permissions to change this setting! (Manage Server)");
  }
}


async function sendWaifu(message, tags, messageText) {
  if (!message.guild || !settings[message.guild.id] || !settings[message.guild.id]['NSFW']) {
    tags.push("rating:safe");
  }

  //get username if DM or displayName if server
  var username = message.member ? message.member.displayName : message.author.username;

  var image = await waifu.deliverWaifu(tags);
  if (image) {
    message.channel.sendEmbed({image: {url: `http:${image[0].file_url}`},
                               color: 3447003,
                               title: username + ', ' + `your ${messageText} is ${image[0].name}`,
                               description: `http://gelbooru.com/index.php?page=post&s=view&id=${image[0].id}`});
  }
  else {
    message.reply("Could not find an image. Did you use the correct tags?")
  }
  // waifu.deliverWaifu(tags)    //get random waifu with specified tags
  //      .then(image => {       //send message
  //        message.channel.sendEmbed({image: {url: `http:${image[0].file_url}`},
  //                                   color: 3447003,
  //                                   title: username + ', ' + `your ${messageText} is ${image[0].name}`,
  //                                   description: `http://gelbooru.com/index.php?page=post&s=view&id=${image[0].id}`});
  //      })
  //      .catch(message.reply("Could not find an image. Check your tags if applicable."))

}


function sendHelp(message) {
  message.channel.send("__**Commands:**__\n"+
                       "**@" + client.user.username + " nsfw on|off** - Turn nsfw pictures on/off. Defaults to off.\n"+
                       "**waifu** - Get a random waifu.\n"+
                       "**waifu [*your_tags_here*]** - Get a random waifu with specified tags.\n"+
                       "**monstergirl** - Get a random monstergirl.\n"+
                       "**shipgirl** - Get a random shipgirl.\n"+
                       "**tankgirl** - Get a random tankgirl.\n"+
                       "\n__**Help:**__\n"+
                       "**@" + client.user.username + " help:** - Display this help message.\n"+
                       "**@" + client.user.username + " aliases DM:** - Send a DM with a list of tag aliases.\n"+
                       "**@" + client.user.username + " aliases file:** - Send a DM with the aliases file. Might be easier to read.");
}


function sendAliasesDM(message) {
  var aliasList = waifu.stringifyAliases();
  message.author.send("__**Tag Aliases:**__\n");

  for(let list of aliasList) {
    message.author.send(list);
  }
}


function sendAliasesFile (message) {
  message.author.sendFile('./config/aliases.json');
}


/*****************************
*        MAIN COMMANDS       *
*****************************/
client.on('message', (message) => {
  if (message.author.bot) return;

  //waifu
  if (message.content.toLowerCase().indexOf("waifu") !== -1 && !message.content.startsWith("@Waifubot")) {
    if (message.content.toLowerCase().startsWith("waifu")) {            //treat next words as tags if first word is waifu
      var tags = baseTags.concat(message.content.slice(6).split(" "));  //separate tags
      tags = tags.filter(tag => {return tag != '';});                   //remove empty tags
    } else {
      var tags = baseTags;  //only use standard tags otherwise
    }

    var messageText = "waifu";
    sendWaifu(message, tags, messageText);
  }

  //monstergirl
  else if (message.content.toLowerCase().indexOf("monstergirl") !== -1) {
    var tags = baseTags.concat("monster_musume_no_iru_nichijou");
    var messageText = "monstergirl";
    sendWaifu(message, tags, messageText);
  }

  //shipgirl
  else if (message.content.toLowerCase().indexOf("shipgirl") !== -1) {
    var tags = baseTags.concat("kantai_collection");
    var messageText = "shipgirl";
    sendWaifu(message, tags, messageText);
  }

  //tankgirl
  else if (message.content.toLowerCase().indexOf("tankgirl") !== -1) {
    var tags = baseTags.concat("girls_und_panzer");
    var messageText = "tankgirl";
    sendWaifu(message, tags, messageText);
  }

  //help message
  else if (message.isMentioned(client.user)) {
    if (message.content.indexOf("help") !== -1) {
      sendHelp(message);
    }

    else if (message.content.indexOf("nsfw on") !== -1) {
      toggleNSFW(message, true);
    }

    else if (message.content.indexOf("nsfw off") !== -1) {
      toggleNSFW(message, false);
    }

    //send alias list
    else if (message.content.indexOf("aliases DM") !== -1) {
      sendAliasesDM(message);
    }

    //send alias file
    else if (message.content.indexOf("aliases file") !== -1) {
      sendAliasesFile(message);
    }
  }
});


/***********************
*     FUN COMMANDS     *
***********************/
client.on('message', (message) => {
  if (message.content == "ping") {
        message.channel.sendMessage("pong");
  }
  else if (message.content.toLowerCase().indexOf("navy weeb") !== -1) {
        message.channel.sendMessage("Nani the fuck did you just fucking iimasu about watashi, you chiisai bitch desuka? Watashi’ll have anata know that watashi graduated top of my class in Nihongo 3, and watashi’ve been involved in iroirona Nihongo tutoring sessions, and watashi have over sanbyaku perfect test scores. Watashi am trained in kanji, and watashi is the top letter writer in all of southern California. Anata are nothing to watashi but just another weaboo. Watashi will korosu anata the fuck out with vocabulary the likes of which has never been mimasu’d before on this continent, mark watashino fucking words. Anata thinks anata can get away with hanashimasing that kuso to watashi over the intaaneto? Omou again, fucker. As we hanashimasu, watashi am contacting watashino secret netto of otakus across the USA, and anatano IP is being traced right now so you better junbishimasu for the ame, ujimushi. The ame that korosu’s the pathetic chiisai thing anata calls anatano life. You’re fucking shinimashita’d, akachan.");
  }
});


/******************
*      LOGIN      *
******************/
client.login(oauth2.token);
