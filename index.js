/*
Running KarenOS v1.0
$help for all Commands
"So, typical day of failure, I see, huh darling?"
*/
const config = require('./config.json');
const { MongoClient } = require('mongodb');
const Discord = require("discord.js");
var idList = [];

const clientBot = new Discord.Client();

clientBot.login(config.discordJS.token);

clientBot.on("ready", () => {
    console.log("Bot is online");
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.mongodb.database);
        var query = { bannedAt: { $gt: 1 } };
        dbo.collection(config.mongodb.collection).find(query).forEach(e => {
            idList.push(e);
        });
    });
})

clientBot.on("message", msg => {
    console.log(msg.author.username + ": " + msg.content);
    if (msg.content.startsWith(config.discordJS.prefix) && !msg.author.bot) {
        let args = msg.content.substring(config.discordJS.prefix.length).split(" ");
        switch (args[0]) {
            case "help":
                var helpEmbedd = new Discord.MessageEmbed().setColor("FF0101");
                helpEmbedd.setTitle("Options");
                helpEmbedd.addFields({ name: "$help", value: "List aller Commands" }, { name: "$hs", value: "Ugur Beleidigen" }, { name: "$timeout + User + Zeit in Sekunden", value: "Hindert User daran für X Sekunden Nachrichten zu schreiben" }, { name: "$list", value: "Liste aller Timeouts" }, { name: "$unban + User", value: "Hebt Timeout auf" }, { name: "$playlist", value: "Spiel Krosse Krabbe 3 Playlist ab" }, { name: "$reminder + Zeit", value: "Errinere Mich in X Zeit an etwas" });
                msg.channel.send({ embed: helpEmbedd });
                break;
            case "hs":
                let ping = "<@!" + config.discordJS.ugurID + ">";
                msg.channel.send("Fick deine Buntstiftdose! " + ping);
                break;
            case "timeout":
                var bannAuthor = msg.author.id;
                var bannedAt = Date.now() / 1000;
                var bannedUntil = bannedAt + parseInt(args[2]);
                var bannedID = args[1];


                timeoutObject = {
                    _id: bannedID,
                    bannAuthor,
                    bannedAt,
                    bannedUntil,
                    bannedID
                }

                MongoClient.connect(config.mongodb.url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db(config.mongodb.database);
                    var query = { _id: bannedID };
                    dbo.collection(config.mongodb.collection).findOne(query, function(err, result) {
                        if (err) throw err;
                        if (result == undefined || result == null) {
                            insertUser(timeoutObject);
                            console.log("No Matching ID found");
                        } else {
                            updateUser(timeoutObject);
                            console.log("Found Matching ID in Database");
                        }
                        db.close();
                    });
                });
                msg.reply("Added " + bannedID + " to Timeout List until: " + new Date(bannedUntil * 1000));
                break;
            case "list":
                var listEmbedd = new Discord.MessageEmbed().setColor("FF0101");
                listEmbedd.setTitle("Timeouts:");
                idList.forEach(e => {
                    listEmbedd.addFields({ name: e.bannedID, value: "Banned until : " + new Date(e.bannedUntil) * 1000 });
                });
                msg.channel.send({ embed: listEmbedd });
                break;
            case "unban":
                idList.forEach(e => {
                    if (e.bannedID == args[1]) {
                        removeUser(args[1]);
                        var index = idList.indexOf(args[1]);
                        idList.pop(index);
                    }
                });
                break;
            case "playlist":
                msg.reply("Comming in V1.3");
                break;
            case "reminder":
                msg.reply("Comming in V1.3");
                break;
            case "debug":
                break;
            default:
                msg.reply("Unknown Command");
                break;
        }
    } else {
        idList.forEach(e => {
            if (e.bannedID == "<@!" + msg.author.id + ">") {
                if (Date.now() / 1000 >= e.bannedUntil) {
                    removeUser("<@!" + msg.author.id + ">");
                    var index = idList.indexOf(e);
                    idList.pop(index);
                } else {
                    deleteHandler(msg);
                }
            }
        })
    }
});

function updateUser(timeoutObj) {
    MongoClient.connect(config.mongodb.url, function(err, db) {
        var dbo = db.db(config.mongodb.database);
        var query = { id: timeoutObj.id };
        dbo.collection(config.mongodb.collection).updateOne(query, { $set: timeoutObj }, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });
}

function insertUser(timeoutObj) {
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.mongodb.database);
        dbo.collection(config.mongodb.collection).insertOne(timeoutObj, function(err, res) {
            if (err) throw err;
            idList.push(timeoutObj);
            console.log("1 document inserted");
            db.close();
        });
    });
}

function removeUser(userID) {
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.mongodb.database);
        var myquery = { _id: userID };
        dbo.collection(config.mongodb.collection).deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });
    });
}

function deleteHandler(msg) {
    msg.delete().then(console.log("1 message deleted")).catch(console.error);
}