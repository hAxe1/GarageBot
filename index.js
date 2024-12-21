const { Client, Collection, GatewayIntentBits  } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config()
const discordToken = process.env.TOKEN;
// Client instances.
const client = new Client({
        intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildMembers
        ],
        presence: {
                status: 'online',
                activities: [{
                        name: '/help | Stop verifying your dad\'s BMW.',
                        type: 'PLAYING',
                }]
        }
        });

//Command Handler Collection

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


//Event handler:
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
        } else {
                client.on(event.name, (...args) => event.execute(...args));
        };
};

process.on('unhandledRejection', error => {
        console.error('Unhandled promise rejection:', error);
});

client.login(discordToken);
