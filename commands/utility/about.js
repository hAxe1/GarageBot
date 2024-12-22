const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Message } = require('discord.js');
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
        
        const inviteEmbed = new EmbedBuilder()
        .setTitle('GarageBot Vehicle Verification')
        .setDescription('We\'re simplifying the process of verifying your vehicles across Discord by providing a seamless and feature full experience.')
        .addFields({name: 'Features', value: '• A garage system to store and display all your vehicles.\n• Seamless verifcation process with the help of buttons.\n• Slash commands for a powerful and interactive experience.', inline: false})
        .addFields({name: 'Servers', value: `${totalGuilds.toLocaleString()} Servers`, inline: true})
        .addFields({name: 'Verified Users', value: `${totalVerifiedUsers.toLocaleString()} Users | ${verifiedUsersInServer} Users In Server`, inline: true})
        .addFields({name: 'Verified Rides', value: `${totalVerifiedRides.toLocaleString()} Vehicles | ${verifiedRidesInServer} Vehicles In Server`, inline: true})
        .setColor('#FFFCFF')
        .setFooter({
            text: `Made with 💖 by ${ownerTag}`,
            iconURL: ownerAvatar
        });
/*
        const InviteButton = new ButtonBuilder()
        .setLabel('Invite')
        .setStyle('Link')
        .setURL(botInvite);

        const supportServerButton = new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle('Link')
        .setURL(supportServerInvite);

        const patreonButton = new ButtonBuilder()
        .setLabel('Patreon')
        .setStyle('Link')
        .setURL(patreonLink);

        const row = new ActionRowBuilder() 
        .addComponents(InviteButton, supportServerButton, patreonButton)
  */      
        await interaction.reply({
            embeds: [inviteEmbed],
  //        components: [row]
        });

	},
};
