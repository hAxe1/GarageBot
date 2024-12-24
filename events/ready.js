require('dotenv').config()
const mongoURI = process.env.MONGOURI;
const mongoose = require('mongoose');
const { Events } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
        mongoose.connect(mongoURI)
        .then(result => console.log('MongoDB connection established.'))
        .catch(e => console.log(`MongoDB connection failed.\nErr: ${e}`));
		client.user.setPresence({
			activities: [{
				name: '/help | Welcome to BigTime | Verify your ride.',

			}]	
		})
	},
};
