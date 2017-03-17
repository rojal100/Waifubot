const Discord  = require('discord.js');
const fs       = require('fs');
const path     = require('path');
const bot      = require('./modules/waifu.js');
const oauth2   = require('./config/oauth2.json');
const baseTags = require('./config/basetags.json').tags;
const client   = new Discord.Client();



//Ready notification
client.on('ready', () => {
  console.log('Connected!');
});


/*****************************
*        MAIN COMMANDS       *
*****************************/
// waifu
client.on('message', (message) => {
  if (!message.author.bot && message.content.indexOf("waifu") !== -1) {   //check if message contains command
    if (message.content.startsWith("waifu")) {    //treat next words as tags if first word is waifu
      var tags = baseTags.concat(message.content.slice(6).split(" "));
    }
    else {
      var tags = baseTags;  //only use standard tags otherwise
    }

    var waifu = bot.deliverWaifu(tags);   //get random waifu with specified tags

    //send message
    waifu.then(result => {
      message.channel.sendEmbed({image: {url: `http:${result[0].file_url}`},
                                 color: 3447003,
                                 title: "Your waifu, fam.",
                                 description: `http://gelbooru.com/index.php?page=post&s=view&id=${result[0].id}`})
    });
  }
});

// monstergirl
client.on('message', (message) => {
  if (!message.author.bot && message.content.indexOf("monstergirl") !== -1) {

    var tags = baseTags.concat("monster_musume_no_iru_nichijou");   //tag for monstergirl

    var waifu = bot.deliverWaifu(tags)
    waifu.then(result => {
      message.channel.sendEmbed({image: {url: `http:${result[0].file_url}`},
                                 color: 3447003,
                                 title: "Your monstergirl, fam.",
                                 description: `http://gelbooru.com/index.php?page=post&s=view&id=${result[0].id}`})
    });
  }
});


/***********************
*     FUN COMMANDS     *
***********************/
client.on('message', (message) => {
    if (message.content == 'ping') {
        message.channel.sendMessage('pong');
  }

  if (message.content == 'navy weeb') {
        message.channel.sendMessage("Nani the fuck did you just fucking iimasu about watashi, you chiisai bitch desuka? Watashi’ll have anata know that watashi graduated top of my class in Nihongo 3, and watashi’ve been involved in iroirona Nihongo tutoring sessions, and watashi have over sanbyaku perfect test scores. Watashi am trained in kanji, and watashi is the top letter writer in all of southern California. Anata are nothing to watashi but just another weaboo. Watashi will korosu anata the fuck out with vocabulary the likes of which has never been mimasu’d before on this continent, mark watashino fucking words. Anata thinks anata can get away with hanashimasing that kuso to watashi over the intaaneto? Omou again, fucker. As we hanashimasu, watashi am contacting watashino secret netto of otakus across the USA, and anatano IP is being traced right now so you better junbishimasu for the ame, ujimushi. The ame that korosu’s the pathetic chiisai thing anata calls anatano life. You’re fucking shinimashita’d, akachan.");
  }
});


/******************
*      LOGIN      *
******************/
client.login(oauth2.token);
