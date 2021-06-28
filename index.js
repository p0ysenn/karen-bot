/*
Running KarenOS v1.0
$help for all Commands
"So, typical day of failure, I see, huh darling?"
*/
const config = require('./config.json');
const { MongoClient } = require('mongodb');
const Discord = require("discord.js");

const clientBot = new Discord.Client();
const mongoclient = new MongoClient(config.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true });





clientBot.login(config.discordJS.token);

clientBot.on("ready", () => {
    console.log("Bot is online");
})

clientBot.on("message", msg => {
    if (msg.content.startsWith(config.discordJS.prefix) && !msg.author.bot) {
        let args = msg.content.substring(config.discordJS.prefix.length).split(" ");
        switch (args[0]) {
            case "hs":
                let ping = "<@!" + ugurID + ">";
                msg.channel.send("Fick deine Buntstiftdose! " + ping);
                break;
            case "timeout":
                let time = Date.now();
                let out = parseInt(args[2]) * 60000;
                timeoutPings.push({
                    "id": args[1],
                    "endtime": time + out
                });
                console.log(timeoutPings);
                msg.reply("Added User to Timeout List until: " + new Date(time + out));
                break;
            case "debug":
                timeoutUser(args[1], 124);
                break;
            case "list":
                msg.reply("Comming in V1.2")
                break;
            case "playlist":
                msg.reply("Comming in V1.3");
                break;
            default:
                msg.reply("Unknown Command");
                break;
        }
    }
});


function timeoutUser(id, time) {
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("KarenBot");
        var timeoutObj = {
            _id: id,
            time
        };
        //TODO Check DB for existing ID
        var query = { _id: id };
        dbo.collection("timeouts").find(query).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
        });
        if (result.length == 0) {
            dbo.collection("timeouts").insertOne(timeoutObj, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
        } else {
            var newvalues = { $set: { name: "Mickey", address: "Canyon 123" } };
            dbo.collection("customers").updateOne(query, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                db.close();
            });
        }
    });
}