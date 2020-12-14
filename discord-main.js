const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./configs/settings.json");
const fs = require("fs");
const moment = require("moment");
const db = require('quick.db')


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.config.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.config.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

const init = async () => {
  await fs.readdir("./commands/", (err, files) => {
    if (err) console.log(err)
    console.log(`${moment().format("ss:mm:HH DD/MM/YYYY")} | ${files.length} komut yükleniyor...`)
    files.forEach((f, i) => {
      let pull = require(`./commands/${f}`);
      console.log(`${moment().format("ss:mm:HH DD/MM/YYYY")} | ${pull.config.name.toUpperCase()} adlı komut yüklendi!`)
      client.commands.set(pull.config.name, pull);  
      pull.config.aliases.forEach(alias => {
        client.aliases.set(alias, pull.config.name)
      });
    });
  });

  await fs.readdir('./events/', (err, files) => {
  if (err) console.error(err);
	console.log(`${moment().format("ss:mm:HH DD/MM/YYYY")} |`)
    console.log(`${moment().format("ss:mm:HH DD/MM/YYYY")} | ${files.length} olay yükleniyor...`);
    files.forEach(f => {
      const eventName = f.split(".")[0];
      const event = require(`./events/${f}`);
      client.on(eventName, event.bind(null, client));
      console.log(`${moment().format("ss:mm:HH DD/MM/YYYY")} | ${eventName.toUpperCase()} adlı olay yüklendi!`);
    });
  });

  if (!db.fetch("Giveaways")) db.set("Giveaways", []);
  client.login(config.token);
}

init()

const log = message => {
  console.log(`${moment().format("ss:mm:HH DD/MM/YYYY")} | ${message}`);
};

client.on("ready", () => {
  client.user.setStatus('idle');
  }); 

client.on("guildCreate", guild => {
  let swain = client.channels.cache.get("782243967718653952") //Eklenince ve Atılınca Mesaj Atılcak Kanal ID.

 const byqush = new Discord.MessageEmbed()
.setTitle("Sunucuya Eklendim")
.setColor("GREEN")
.addField('▪ Sunucu İsmi', `\`${guild.name}\``)
.addField('▪ Üye Sayısı', `\`${guild.members.cache.size}\``)
.addField('▪ Kurucu', `\`${guild.owner.user.tag}\``)
swain.send(byqush)
});

client.on("guildDelete", guild => {
  let swain = client.channels.cache.get("782243967718653952") //Eklenince ve Atılınca Mesaj Atılcak Kanal ID.

 const byqush = new Discord.MessageEmbed()
.setTitle("Sunucudan Atıldım")
.setColor("RED")
.addField('▪ Sunucu İsmi', `\`${guild.name}\``)
.addField('▪ Üye Sayısı', `\`${guild.members.cache.size}\``)
.addField('▪ Kurucu', `\`${guild.owner.user.tag}\``)
swain.send(byqush)
});
