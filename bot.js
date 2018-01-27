const Discord  = require('discord.js');
const fs       = require('fs');
const waifu    = require('./modules/waifu.js');
const oauth2   = require('./config/oauth2.json');
const baseTags = require('./config/basetags.json').tags;
const client   = new Discord.Client();

//check and import settings file if it exists, create it if not
if (fs.existsSync('./config/settings.json')) {
	var settings = require('./config/settings.json');
}
else {
	fs.writeFileSync('./config/settings.json', JSON.stringify({}), 'utf8', function(err) {
		if (err) throw err});
	var settings = require('./config/settings.json');
}


/***************************
*   CONNECTION FUNCTIONS   *
***************************/
//ready notification, check if server is in settings.json
client.on('ready', () => {
	console.log("Ready! Connected to " + client.guilds.array().length + " servers");
	client.user.setActivity("@" + client.user.username + " help");

	//if server isn't in settings, add it w/ default nsfw setting
	for (let server of client.guilds.array()) {
		if (!settings[server.id]) {
			settings[server.id] = {'NSFW': false};
			var modified = true;
		}
	}

	//stringify and write settings to file
	if (modified) {
		var json = JSON.stringify(settings, null, "\t");
		fs.writeFileSync('./config/settings.json', json, 'utf8', function(err) {
			if (err) throw err});
	}
});

//add nsfw setting on server join
client.on('guildCreate', guild => {
	settings[guild.id] = {'NSFW': false};

	var json = JSON.stringify(settings, null, "\t");
	fs.writeFileSync('./config/settings.json', json, 'utf8', function(err) {
		if (err) throw err});
});


/************************
*       FUNCTIONS       *
************************/
//Toggle NSFW setting
function toggleNSFW(message, setting) {
	if (!message.member) {
		message.reply("Cannot change settings. This is not a server.");
		return;
	}

	else if (message.member.hasPermission("MANAGE_GUILD")) {
		//change setting
		var server = message.guild.id;
		settings[server]['NSFW'] = setting;

		//write to settings.json
		var json = JSON.stringify(settings, null, "\t");
		fs.writeFileSync('./config/settings.json', json, 'utf8', function(err) {
			if (err) throw err});

		//respond to request and log in console
		message.reply(setting ? "NSFW enabled." : "NSFW disabled.");
		console.log("Server: " + message.guild.name + " - " + message.guild.id + "\nNSFW: " + setting + "\n");
	}
	else {
		message.reply("You don't have the required permissions to change this setting! (Manage Server)");
	}
}


//Send Waifu
async function sendWaifu(message, tags, commandName) {
	//add sfw tag if nsfw isn't enabled or in a DM channel
	if (!message.guild || !settings[message.guild.id]['NSFW']) {
		tags.push("rating:safe");
	}

	//get username if DM or displayName if server
	var username = message.member ? message.member.displayName : message.author.username;
	
	//get a random image
	var image = await waifu.deliverWaifu(tags);

	//send image or respond with error
	if (image) {
		message.channel.send({embed: {
			image: {url: `${image.file_url}`},
			color: 3447003,
			title: username + ', ' + `your ${commandName} is ${image.name}`,
			description: `http://gelbooru.com/index.php?page=post&s=view&id=${image.id}`}});
	}
	else {
		message.reply("Could not find an image. Check your tags and try again.")
	}

	console.log(message.author.username + ":", tags, "\n");
}


//Help message
function sendHelp(message) {
	message.channel.send("__**Commands:**__\n"+
	                     "**@" + client.user.username + " nsfw on|off** - Turn nsfw pictures on/off. Defaults to off.\n\n"+
	                     "**waifu | husbando** - Get a random waifu/husbando.\n"+
	                     "**waifu | husbando *your_tags_here*** - Get a random waifu/husbando with specified tags.\n\n"+
	                     "**touhou** - Get a random touou.\n"+
	                     "**monstergirl** - Get a random monstergirl.\n"+
	                     "**shipgirl** - Get a random shipgirl.\n"+
	                     "**tankgirl** - Get a random tankgirl.\n\n"+
	                     "\n__**Help:**__\n"+
	                     "**@" + client.user.username + " help** - Display this help message.\n"+
	                     "**@" + client.user.username + " aliases DM** - Send a DM with a list of tag aliases.\n"+
	                     "**@" + client.user.username + " aliases file** - Send a DM with the aliases file. Might be easier to read.");
}


/*****************************
*        MAIN COMMANDS       *
*****************************/
client.on('message', (message) => {
	//do nothing if command came from a bot
	if (message.author.bot) return;

	//make message lower case before checking for commands
	var messageText = message.content.toLowerCase()

	//help and settings
	if (message.isMentioned(client.user)) {
		if (messageText.includes("help")) {
			sendHelp(message);
		}

		//nsfw settings
		else if (messageText.includes("nsfw on")) {
			toggleNSFW(message, true);
		}
		else if (messageText.includes("nsfw off")) {
			toggleNSFW(message, false);
		}

		//send alias list as text
		else if (messageText.includes("aliases text")) {
			var aliasList = waifu.stringifyAliases();

			message.author.send("__**Tag Aliases:**__");
			for(let list of aliasList) {
				message.author.send(list);
			}
		}

		//send alias list as file
		else if (messageText.includes("aliases file")) {
			message.author.sendFile('./config/aliases.json');
		}
	}

	//waifu
	else if (messageText.includes("waifu")) {
		//treat next words as tags if first word is waifu
		if (messageText.startsWith("waifu")) {

			//separate tags
			var tags = baseTags.concat(messageText.slice(messageText.indexOf("waifu") + 6).split(" "));

			//remove empty tags
			tags = tags.filter(tag => {return tag != '';});
		}
		//only use standard tags otherwise
		else {
			var tags = baseTags;
		}

		var commandName = "waifu";
		sendWaifu(message, tags, commandName);
	}

	//husbando
	else if (messageText.includes("husbando")) {
		var tags = ["1boy", "solo", "-original"]

		if (messageText.startsWith("husbando")) {
			tags = tags.concat(messageText.slice(messageText.indexOf("waifu") + 8).split(" "));
			tags = tags.filter(tag => {return tag != '';});
		}

		var commandName = "husbando";
		sendWaifu(message, tags, commandName);
	}

	//touhou
	else if (messageText.includes("touhou")) {
		var tags = baseTags.concat("touhou");
		var commandName = "Touhou";
		sendWaifu(message, tags, commandName);
	}

	//monstergirl
	else if (messageText.includes("monstergirl")) {
		var tags = baseTags.concat("monster_musume_no_iru_nichijou");
		var commandName = "monstergirl";
		sendWaifu(message, tags, commandName);
	}

	//shipgirl
	else if (messageText.includes("shipgirl")) {
		var tags = baseTags.concat("kantai_collection");
		var commandName = "shipgirl";
		sendWaifu(message, tags, commandName);
	}

	//tankgirl
	else if (messageText.includes("tankgirl")) {
		var tags = baseTags.concat("girls_und_panzer");
		var commandName = "tankgirl";
		sendWaifu(message, tags, commandName);
	}
});

/*******************************
*     FUN/USELESS COMMANDS     *
*******************************/
client.on('message', (message) => {
	if (message.content == "ping") {
		message.channel.sendMessage("pong");
	}
	else if (message.content.includes("navy weeb")) {
		message.channel.sendMessage("Nani the fuck did you just fucking iimasu about watashi, you chiisai bitch desuka? Watashi’ll have anata know that watashi graduated top of my class in Nihongo 3, and watashi’ve been involved in iroirona Nihongo tutoring sessions, and watashi have over sanbyaku perfect test scores. Watashi am trained in kanji, and watashi is the top letter writer in all of southern California. Anata are nothing to watashi but just another weaboo. Watashi will korosu anata the fuck out with vocabulary the likes of which has never been mimasu’d before on this continent, mark watashino fucking words. Anata thinks anata can get away with hanashimasing that kuso to watashi over the intaaneto? Omou again, fucker. As we hanashimasu, watashi am contacting watashino secret netto of otakus across the USA, and anatano IP is being traced right now so you better junbishimasu for the ame, ujimushi. The ame that korosu’s the pathetic chiisai thing anata calls anatano life. You’re fucking shinimashita’d, akachan.");
	}
});


/******************
*      LOGIN      *
******************/
client.login(oauth2.token);
