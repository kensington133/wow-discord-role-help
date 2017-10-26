require('dotenv').config();

const Eris = require("eris");
const blizzard = require('blizzard.js').initialize({ apikey: process.env.BLIZZARD_API_KEY });

console.log('DISCORD_BOT_TOKEN', process.env.DISCORD_BOT_TOKEN);
console.log('BLIZZARD_API_KEY', process.env.BLIZZARD_API_KEY);

const bot = new Eris(process.env.DISCORD_BOT_TOKEN); // Replace DISCORD_BOT_TOKEN in .env with your bot accounts token

// blizzard.wow.guild(['profile', 'members'], { realm: 'thunderhorn', name: 'evocati', origin: 'eu' })
// .then(response => {
//     console.log(response.data);
// });

bot.on("error", (err) => {
    console.log("Error!", err);
});

bot.on("ready", () => {
    console.log("Ready!");
});

bot.on("messageCreate", (msg) => {
    if(msg.content === "!ping") {
        bot.createMessage(msg.channel.id, "Pong!");
    }
});

bot.connect(); // Get the bot to connect to Discord
