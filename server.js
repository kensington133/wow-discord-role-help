require('dotenv').config();
var removeDiacritics = require('./helpers.js').removeDiacritics;

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

    console.log(msg.content);

    if(!msg.author.bot && msg.content.indexOf('!wh-setregion') > -1){
        var parts = msg.content.split(' ');

        region = parts[1];

        bot.createMessage(msg.channel.id, 'Region set to '+ parts[1].toUpperCase());
    }

    if(!msg.author.bot && msg.content.indexOf('!wh-setrealm') > -1){
        var parts = msg.content.split(/\s(.+)/);

        realm = parts[1];

        bot.createMessage(msg.channel.id, 'Realm set to '+ parts[1].toUpperCase());
    }

    if(!msg.author.bot && msg.content.indexOf('!wh-setguild') > -1){
        var parts = msg.content.split(/\s(.+)/);

        guild = parts[1];

        bot.createMessage(msg.channel.id, 'Guild set to '+ parts[1].toUpperCase());
    }

    if(!msg.author.bot && msg.content === '!wh-save'){
        console.log(region, realm, guild, msg.channel.guild.id);
        if(region && realm && guild){
            db.insert({ region: region, guild: guild, realm: realm }, msg.channel.guild.id, function(err, body) {
                if (!err){
                    console.log(body);
                    bot.createMessage(msg.channel.id, 'Successfully saved to DB: ' + body);
                } else {
                    console.log(body);
                    bot.createMessage(msg.channel.id, 'Error saving to DB: ' + body);
                }
            });
        } else {
            bot.createMessage(msg.channel.id, 'You need to provide your region, realm and guild name using the commands: `!wh-setregion EU|US` `!wh-setrealm realm name` and `!wh-setguild guild name`');
        }
    }

    if(!msg.author.bot && msg.content === '!wh-load'){
        db.get(msg.channel.guild.id, { revs_info: true }, function(err, body) {
            if (!err){
                region = body.region;
                realm = body.realm;
                guild = body.guild;
                bot.createMessage(msg.channel.id, `Load successful
Region: ${body.region}
Realm: ${body.realm}
Guild: ${body.guild}`);
            } else {
                bot.createMessage(msg.channel.id, 'You need to provide and save your region, realm and guild name using the commands: `!wh-setregion EU|US` `!wh-setrealm realm name` and `!wh-setguild guild name, saving them with !wh-save`');
            }
        });
    }

    if(!msg.author.bot && msg.content === '!wh-guildinfo'){
        if(region && realm && guild){
            blizzard.wow.guild(['profile', 'members'], { realm: realm.toLowerCase(), name: guild.toLowerCase(), origin: region.toLowerCase() })
            .then(response => {
                console.log(response.data);
                var guildData = response.data;

                var message = `Guild found! ${guildData.name}
Realm: ${guildData.realm}
Battle group: ${guildData.battlegroup}
Members: ${guildData.members.length}`;

                bot.createMessage(msg.channel.id, message);
            });
        } else {
            bot.createMessage(msg.channel.id, 'You need to provide and save your region, realm and guild name using the commands: `!wh-setregion EU|US` `!wh-setrealm realm name` and `!wh-setguild guild name`, saving them with `!wh-save`');
        }
    }

    if(!msg.author.bot && msg.content === '!wh-rolelist'){
        let message = `${msg.channel.guild.name} roles:\r\n` + msg.channel.guild.roles.map(role => `${role.name}: ${role.position}`).join('\r\n');

        bot.createMessage(msg.channel.id, message);
    }

    if(!msg.author.bot && msg.content === '!wh-rolecheck'){
        // console.log(msg.channel.guild.roles);
        blizzard.wow.guild(['profile', 'members'], { realm: realm.toLowerCase(), name: guild.toLowerCase(), origin: region.toLowerCase() })
        .then(response => {
            // console.log(response.data);
            var guildData = response.data;

            let guildMembers = guildData.members.sort(function(a, b){
                return a.rank-b.rank;
            });

            let discordMembers = msg.channel.guild.members;

            // console.log(msg.channel.guild);
            // console.log(msg.channel.guild.members);
            // console.log(discordMembers[0]);

            let message = `${guildData.name} members:\r\n\r\n` + discordMembers.map(function(discordMember){
                if(!discordMember.user.bot){
                    var usersGuildMember = guildMembers.find(function(guildMember){
                        return  (removeDiacritics(guildMember.character.name) == removeDiacritics(discordMember.nick || discordMember.user.username))
                                ||
                                (guildMember.character.name == (discordMember.nick || discordMember.user.username));
                    });
                }

                // console.log(msg.channel.guild.roles);

                let assignedRoles = [];
                for(let i in discordMember.roles){

                    var assignedRole = msg.channel.guild.roles.find(function(role){
                        return role.id == discordMember.roles[i].id;
                    });

                    assignedRoles.push(assignedRole);
                }

                if(assignedRoles.length > 0){
                    console.log(assignedRoles);
                }

                if (usersGuildMember){
                    return `Discord name: ${discordMember.nick || discordMember.user.username}

WoW Name: ${usersGuildMember.character.name}

Discord rank: ${discordMember.rank}

WoW Rank: ${usersGuildMember.rank}

`;
                }
            }).join('\r\n');

            bot.createMessage(msg.channel.id, message);
        });
    }
});

bot.connect(); // Get the bot to connect to Discord
