require('dotenv').config();

const Eris = require("eris");
const blizzard = require('blizzard.js').initialize({ apikey: process.env.BLIZZARD_API_KEY });

console.log('DISCORD_BOT_TOKEN', process.env.DISCORD_BOT_TOKEN);
console.log('BLIZZARD_API_KEY', process.env.BLIZZARD_API_KEY);

const bot = new Eris(process.env.DISCORD_BOT_TOKEN);

var region,realm,guild;

bot.on("error", (err) => {
    console.log("Error!", err);
});

bot.on("ready", () => {
    console.log("Ready!");
});

bot.on("messageCreate", (msg) => {

    console.log(msg);
    console.log(msg.content);

    if(msg.content.indexOf('!wh-setregion') > -1){
        var parts = msg.content.split(' ');

        region = parts[1];

        bot.createMessage(msg.channel.id, 'Region set to '+ parts[1].toUpperCase());
    }

    if(msg.content.indexOf('!wh-setrealm') > -1){
        var parts = msg.content.split(' ');

        realm = parts[1];

        bot.createMessage(msg.channel.id, 'Region set to '+ parts[1].toUpperCase());
    }

    if(msg.content.indexOf('!wh-setguild') > -1){
        var parts = msg.content.split(' ');

        guild = parts[1];

        bot.createMessage(msg.channel.id, 'Guild set to '+ parts[1].toUpperCase());
    }

    if(msg.content === '!wh-guildinfo'){
        console.log(region, realm, guild);
        if(region && realm && guild){
            blizzard.wow.guild(['profile', 'members'], { realm: realm.toLowerCase(), name: guild.toLowerCase(), origin: region.toLowerCase() })
            .then(response => {
                console.log(response.data);
                var guildData = response.data;

                var message = 'Guild found! ' + guildData.name + '\r\n';
                message += 'Realm: '+ guildData.realm +'\r\n';
                message += 'Battle group: '+ guildData.battlegroup +'\r\n';
                message += 'Members: '+ guildData.members.length +'\r\n';

                bot.createMessage(msg.channel.id, message);
            });
        }
    }
});

bot.connect(); // Get the bot to connect to Discord
