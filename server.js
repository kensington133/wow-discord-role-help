require('dotenv').config();

const Eris = require("eris");
const blizzard = require('blizzard.js').initialize({ apikey: process.env.BLIZZARD_API_KEY });

// Load the Cloudant library.
var Cloudant = require('cloudant');

var me = process.env.CLOUDANT_USER;
var password = process.env.CLOUDANT_PASSWORD;

// Initialize the library with my account.
var cloudant = Cloudant({account:me, password:password});

var db = cloudant.db.use("wow_discord_bot");

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

    if(msg.content === '!wh-save'){
        console.log(region, realm, guild, msg.channel.guild.id);
        if(region && realm && guild){
            db.insert({ region: region, guild: guild, realm: realm }, msg.channel.guild.id, function(err, body) {
                if (!err){
                    console.log(body);
                    bot.createMessage(msg.channel.id, 'Successfully save to DB: ' + body);
                } else {
                    console.log(body);
                    bot.createMessage(msg.channel.id, 'Error saving to DB: ' + body);
                }
            });
        } else {
            bot.createMessage(msg.channel.id, 'You need to provide your region, realm and guild name using the commands: `!wh-setregion EU|US` `!wh-setrealm realm name` and `!wh-setguild guild name`');
        }
    }

    if(msg.content === '!wh-load'){
        db.get(msg.channel.guild.id, { revs_info: true }, function(err, body) {
            if (!err){
                region = body.region;
                realm = body.realm;
                guild = body.guild;
                bot.createMessage(msg.channel.id, `Load successful \r\nRegion: ${body.region}\r\nRealm: ${body.realm}\r\nGuild: ${body.guild}`);
            } else {
                bot.createMessage(msg.channel.id, 'You need to provide your region, realm and guild name using the commands: `!wh-setregion EU|US` `!wh-setrealm realm name` and `!wh-setguild guild name`');
            }
        });
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
