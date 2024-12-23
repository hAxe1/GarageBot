const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { exitGlobal } = require('../exitGlobal.js');
const { backGlobal } = require('../backGlobal.js');
const garageSchema = require('../../../../../mongodb_schema/garageSchema.js');
const { greenColor, errorEmbed } = require('../../../../utility.js');

async function setName(
    interaction,
    initiatorData, 
    userData,
    guildData,
    embedColor,
    footerData,
    garageData,
    selectedVehicleData,
    logChannel,
    providedName
)
{

//Initiator Details
const initiatorAvatar = initiatorData.displayAvatarURL({ dynamic: true });
const initiatorUsername = initiatorData.username;
const initiatorId = initiatorData.id;

//User Details
const userId = userData.id;
const username = userData.username;
const userAvatar = userData.displayAvatarURL({ dynamic: true });
const userTag = userData.tag;

//Guild Details
const guildId = guildData.id;
const guildName = guildData.name;
const guildIcon = guildData.iconURL({ dynamic: true });	

//Vehicle Details
const vehicleName = selectedVehicleData.vehicle;
const verificationImage = selectedVehicleData.verificationImageLink || "https://www.youtube.com/watch?v=dQw4w9WgXcQ" //Checkout this link.
const vehicleOwnerId = selectedVehicleData.userId;
let vehicleDescription = selectedVehicleData.vehicleDescription;
let vehicleImages = selectedVehicleData.vehicleImages;

//Misc
const mainInteractionId = interaction.id;
const footerIcon = footerData.icon;
const footerText = footerData.text;

//Filters
const buttonFilter = i => i.user.id === initiatorId && i.guild.id === guildId;

await garageSchema.updateOne({guildId: guildId, userId: userId, vehicle: vehicleName }, {$set: {vehicle: providedName }})
.catch(async e => {
    await interaction.editReply({
        embeds: [errorEmbed(e, initiatorAvatar)],
        components: []
    })
    return;
});

const manageNameConfirmDashboardEmbed = new EmbedBuilder()
.setAuthor({
    name: 'Management Dashboard - Vehicle Name',
    iconURL: initiatorAvatar
})
.setDescription('The name has been updated successfully for the following vehicle.')
.setColor(greenColor)
.addFields({name: 'Previous Vehicle Name', value: `[${vehicleName}](${verificationImage})`, inline: true})
.addFields({name: 'New Vehicle Name', value: `[${providedName}](${verificationImage})`, inline: true})
.addFields({name: 'Owner', value: userTag, inline: true})
.setFooter({
    text: footerText,
    iconURL: footerIcon
});

const buttonsRow = new ActionRowBuilder()
.addComponents(
    new ButtonBuilder()
    .setLabel('Successful')
    .setStyle('Success')
    .setCustomId(`disabled`)
    .setDisabled(true),
    new ButtonBuilder()
    .setLabel('Back')
    .setStyle('Secondary')
    .setCustomId(`backNameConfirmed+${mainInteractionId}`),
    new ButtonBuilder()
    .setLabel('Exit')
    .setStyle('Danger')
    .setCustomId(`exitNameConfirmed+${mainInteractionId}`)
);

await interaction.editReply({
    embeds: [manageNameConfirmDashboardEmbed],
    components: [buttonsRow]
});

logChannel.send({
    embeds: [manageNameConfirmDashboardEmbed]
});

const collectedButton = await interaction.channel.awaitMessageComponent({ filter: buttonFilter, componentType: 'BUTTON', time: 60000, max: 1 })
.catch(e => {
});
if(!collectedButton){
    await interaction.followUp({
        embeds: [errorEmbed('No response was received, Ending operation.', initiatorAvatar)],
        ephemeral: true
    });
    await interaction.deleteReply();
    return;
};
if(!collectedButton.deferred) await collectedButton.deferUpdate();
const buttonId = collectedButton.customId;

switch(buttonId){
    case `backNameConfirmed+${mainInteractionId}`:
        backGlobal(
            interaction,
            initiatorData, 
            userData,
            guildData,
            embedColor
        );
        break;
    case `exitNameConfirmed+${mainInteractionId}`:
        exitGlobal(interaction)
        break;
};
    
};


module.exports = { 
    setName
};