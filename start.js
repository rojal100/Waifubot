const forever = require('forever');

// Run bot using forever (auto restart on crash)
forever.start("bot.js", "options.json");