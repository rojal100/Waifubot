# Waifubot
A simple Discord.js bot that grabs a random picture from gelbooru upon typing "waifu" or a related command. Defaults to SFW images only; server moderater can change the setting.

## Requirements
### Libraries
> fs\
> request-promise-native\
> xml2js\
> mathjs


## Setup
Requires a file to be created in the config folder:
#### oauth2.json
```
{
  "token": "YOUR_TOKEN_HERE"
}
```
\
Where YOUR_TOKEN_HERE is the OAuth 2 token for your Discord bot.
