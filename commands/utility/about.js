const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, Message } = require('discord.js');
const { botInvite, supportServerInvite, githubLink, ownerTag, ownerAvatar, patreonLink} = require('../../modules/utility.js');
const garageSchema = require('../../mongodb_schema/garageSchema.js');
const garage = require('../garage/garage.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Information regarding the bot.'),
	async execute(interaction) {
        const initiatorId = interaction.user.id;
		const initiatorUsername = interaction.user.username;
		const initiatorAvatar = interaction.user.displayAvatarURL({ dynamic: true });
        let totalGuilds = 0;
        let totalMembers = 0;
        const guildsData = interaction.client.guilds.cache.map(x => {
            const memberCount = x.memberCount;
            totalGuilds++;
            totalMembers += memberCount
        });
        const totalVerifiedRides = (await garageSchema.find()).length;
        const verifiedRidesInServer = (await garageSchema.find({ guildId: interaction.guild.id })).length;
        const totalVerifiedUsers = (await garageSchema.distinct("userId")).length;
        const verifiedUsersInServer = (await garageSchema.distinct("userId", { guildId: interaction.guild.id })).length;
        
        const inviteEmbed = new MessageEmbed()
        .setTitle('ThrottleBot Vehicle Verification')
        .setDescription('We\'re simplifying the process of verifying your vehicles across Discord by providing a seamless and feature full experience.\nThe bot utilizes Discord\'s latest API version V9 to provide you with the latest features that are available.')
        .addField('Features','• A garage system to store and display all your vehicles.\n• Seamless verifcation process with the help of buttons.\n• Slash commands for a powerful and interactive experience.\n• Syncing across different servers.')
        .addField('Servers', `${totalGuilds.toLocaleString()} Servers`, true)
        .addField('Verified Users', `${totalVerifiedUsers.toLocaleString()} Users | ${verifiedUsersInServer} Users In Server`, true)
        .addField('Verified Rides', `${totalVerifiedRides.toLocaleString()} Vehicles | ${verifiedRidesInServer} Vehicles In Server`, true)
        .setColor('#FFFCFF')
        .setFooter({
            text: `Made with 💖 by ${ownerTag}`,
            iconURL: ownerAvatar
        });

        const InviteButton = new MessageButton()
        .setLabel('Invite')
        .setStyle('LINK')
        .setURL(botInvite);

        const supportServerButton = new MessageButton()
        .setLabel('Support Server')
        .setStyle('LINK')
        .setURL(supportServerInvite);

        const patreonButton = new MessageButton()
        .setLabel('Patreon')
        .setStyle('LINK')
        .setURL(patreonLink);

        const row = new MessageActionRow() 
        .addComponents(InviteButton, supportServerButton, patreonButton)
        
        await interaction.reply({
            embeds: [inviteEmbed],
            components: [row]
        });

	},
};
