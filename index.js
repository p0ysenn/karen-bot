const Discord = require("discord.js");
const clientBot = new Discord.Client();
const token = "ODU3MDI0MTM0NjQyNTMyMzYy.YNJj7A.jT9I1oZxbuFnjugTaVbgzlC6Pc4";
const prefix = "$";
const adminPing = "<@!280703894269460490>";
const ugurPing = "";
var timeoutPing = "<@!246941907287015426>";

clientBot.on("ready", () => {
    console.log("Bot is online")
})

clientBot.login(token);

clientBot.on("message", msg => {
    if (msg.content.startsWith(prefix) && !msg.author.bot) {
        let args = msg.content.substring(prefix.length).split(" ");
        switch (args[0]) {
            case "hs":
                msg.reply("Fick deine Buntstiftdose! " + ugurPing);
                break;
            case "timeout":
                //add Args[1] to timeout list
                //Get date.now() and add args[2]
                //Wait until end of timeout
                break;
            case "debug":
                msg.reply(adminPing);
        }
    }
});