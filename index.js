const config = require('./config.json');
const insults = require('./insults.json');
const { MongoClient } = require('mongodb');
const Discord = require("discord.js");
var idList = [];

const clientBot = new Discord.Client();

//Pull Token from Database and Login Bot
MongoClient.connect(config.mongodb.url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(config.mongodb.database);
    dbo.collection("config").find().forEach(e => {
        if (e.token != undefined) {
            clientBot.login(e.token);
        }
        db.close();
    });
});

//On Login, 
clientBot.on("ready", () => {
    console.log("[SYSTEM] Bot is online \n");
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.mongodb.database);
        dbo.collection(config.mongodb.collection).find().forEach(e => {
            idList.push(e);
            db.close();
        });
    });
    setInterval(() => {
        const newActivity = config.discordJS.promts[Math.floor(Math.random() * config.discordJS.promts.length)];
        clientBot.user.setActivity(newActivity);
        console.log("[SYSTEM] Changed Promt \n")
    }, 20000);
})

//On Message
clientBot.on("message", msg => {
    //Log Messages
    console.log("[USER] " + msg.author.username + ": " + msg.content + "\n");

    //Check for Command
    if (msg.content.startsWith(config.discordJS.prefix) && !msg.author.bot) {

        //Isolate Prefix, Command and Arguments
        let args = msg.content.substring(config.discordJS.prefix.length).split(" ");
        switch (args[0]) {
            case "help": //Display all Commands
                //Create Embed with all Commands
                var helpEmbedd = new Discord.MessageEmbed().setColor("FF0101");
                helpEmbedd.setTitle("Options");
                helpEmbedd.addFields(config.discordJS.commands);
                msg.channel.send({ embed: helpEmbedd });
                break;
            case "hs": //Insult Ugur
                //Combine random insult and Ugurs's Ping
                let ping = "<@!" + config.discordJS.ugurID + ">";
                var insult = insults.insults[Math.floor(Math.random() * insults.insults.length)];
                msg.channel.send(insult + ping);
                break;
            case "timeout": //Timeout User

                //Create Timeout Object Variables
                var bannAuthor = msg.author.id;
                var bannedAt = Date.now() / 1000;
                var banTime = parseInt(args[2]);
                var bannedID = args[1];
                var bannedUntil;

                //Check for valid time argument
                if (banTime > 0) {
                    bannedUntil = bannedAt + banTime;
                } else {
                    bannedUntil = bannedAt + 60;
                }
                //Create Timeout Objekt
                timeoutObject = {
                    _id: bannedID,
                    bannAuthor,
                    bannedAt,
                    bannedUntil,
                    bannedID
                }

                //Connect to DB and Check for existing Timeout for User
                MongoClient.connect(config.mongodb.url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db(config.mongodb.database);
                    var query = { _id: bannedID };
                    dbo.collection(config.mongodb.collection).findOne(query, function(err, result) {
                        if (err) throw err;
                        //Decide if new insert or update is required
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
            case "list": //List all Timeouts

                //Create Embed with all Timeouts
                var listEmbedd = new Discord.MessageEmbed().setColor("FF0101");
                listEmbedd.setTitle("Timeouts:");
                idList.forEach(e => {
                    listEmbedd.addFields({ name: e.bannedID, value: "Banned until : " + new Date(e.bannedUntil) * 1000 });
                });
                msg.channel.send({ embed: listEmbedd });
                break;
            case "unban": //Remove Timeout

                idList.forEach(e => {
                    if (e.bannedID == args[1]) {
                        removeUser(args[1]);
                        var index = idList.indexOf(args[1]);
                        idList.pop(index);
                    }
                });
                break;
            case "playlist": //Play Playlist
                msg.reply("Comming in V1.3");
                break;
            case "reminder": //Reddit Remind Me Bot
                msg.reply("Comming in V1.3");
                break;
            case "debug": //Testing command
                break;
            default:
                msg.reply("Unknown Command");
                break;
        }
    } else {
        //If no command, check for unban
        idList.forEach(e => {
            //Compare every timeouted user with msg author
            if (e.bannedID == "<@!" + msg.author.id + ">") {
                //If User is banned, check if timeout has run out
                if (Date.now() / 1000 >= e.bannedUntil) {
                    //Remove timeout from DB
                    removeUser("<@!" + msg.author.id + ">");
                    var index = idList.indexOf(e);
                    idList.pop(index);
                } else {
                    //Delete message
                    deleteHandler(msg);
                }
            }
        })
    }
});

//Update existing Timeout in Database
function updateUser(timeoutObj) {
    MongoClient.connect(config.mongodb.url, function(err, db) {
        var dbo = db.db(config.mongodb.database);
        var query = { id: timeoutObj.id };
        dbo.collection(config.mongodb.collection).updateOne(query, { $set: timeoutObj }, function(err, res) {
            if (err) throw err;
            console.log("[SYSTEM] Updated 1 Document \n");
            db.close();
        });
    });
}

//Insert Timeout in Database
function insertUser(timeoutObj) {
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.mongodb.database);
        dbo.collection(config.mongodb.collection).insertOne(timeoutObj, function(err, res) {
            if (err) throw err;
            idList.push(timeoutObj);
            console.log("[SYSTEM] Inserted 1 Document \n");
            db.close();
        });
    });
}

//Remove Timeout
function removeUser(userID) {
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.mongodb.database);
        var myquery = { _id: userID };
        dbo.collection(config.mongodb.collection).deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("[SYSTEM] Deleted 1 Document \n");
            db.close();
        });
    });
}

//Delete Message
function deleteHandler(msg) {
    msg.delete().then(console.log("[SYSTEM] Deleted 1 Message \n")).catch(console.error);
}