const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { botInvite, supportServerInvite, githubLink, ownerTag, ownerAvatar, patreonLink} = require('../../modules/utility.js');
const garageSchema = require('../../mongodb_schema/garageSchema.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Starting guide for dummies.'),
	async execute(interaction) {
        await interaction.deferReply({ ephemral: true });
        const initiatorId = interaction.user.id;
		const initiatorUsername = interaction.user.username;
		const initiatorAvatar = interaction.user.displayAvatarURL({ dynamic: true });
        const totalVerifiedRides = (await garageSchema.find()).length
        const supportEmbed = new EmbedBuilder()
        .setTitle('ThrottleBot Vehicle Verification')
        .setDescription('We\'re simplifying the process of verifying your vehicles across Discord by providing a seamless and feature full experience.')
        .addFields({name: 'Usage', value: 'The bot only uses slash commands. Simply type `/` and you will notice the slash command interface pop up. Select the ThrottleBot avatar/logo and you will see all of the bots commands.\nClick on the command you wish to execute and hit enter.\nAlternatively you can also type the command as `/command`\nExample: `/about`\nDiscord Guide: [Click Here](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ)', inline: false})
        .addFields({name: 'Setting up the bot', value: 'Setting up the bot is really easy, simply use the `/setup` command and follow the instructions mentioned.', inline: false})
        .addFields({name: 'Need Support?', value: 'Click on the support button down below to join our support server!', inline: false})
        .setColor('#FFFCFF')
        .setFooter({
            text: `Made with 💖 by ${ownerTag}`,
            iconURL: ownerAvatar
        });
//Removing other buttons for now
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
*/
        const githubLinkButton = new ButtonBuilder()
        .setLabel('GitHub')
        .setStyle('Link')
        .setURL(githubLink);

        const row = new ActionRowBuilder() 
//      .addComponents(InviteButton, supportServerButton, patreonButton, githubLinkButton) // Removing other buttons for now
        .addComponents(githubLinkButton)
        await interaction.editReply({
            embeds: [supportEmbed],
            components: [row]
        });

	},
};
