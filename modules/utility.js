const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')

const guildJoinLogChannelId = '1319908356269281330';
const guildLeaveLogChannelId = '1319908356269281330';
const embedColor = '#FFFCFF';
const botIcon = 'https://cdn.discordapp.com/avatars/1319198533672374394/2b505f2a32b35c82ffb2121aed85e449.png?size=4096';
const botName = 'GarageBot';
const greenIndicator = '<:greenIndicator:975489221643108482>';
const redIndicator = '<:redIndicator:975489221534031892>';
const greenColor = '#77DD77';
const redColor = '#FF6961';
const patreonLogChannelId = '1320553700330311680';
const patreonLink = 'https://www.patreon.com/'
const patreonRedColor = '#F96854';
const patreonBlueColor = '#052D49';
const patreonBanner = 'https://www.patreon.com/';
const patreonBannerLarge = 'https://www.patreon.com/';
const garageIconExample = 'https://cdn.discordapp.com/attachments/975485952325726278/982221023321665546/Garage_Icon.png';
const garageEmbedColorExample = 'https://cdn.discordapp.com/attachments/975485952325726278/983741574125076490/embed_color.png'
const botInvite = 'https://discord.com/';
const botInviteAdmin = 'https://discord.com/';
const supportServerInvite = 'https://discord.com/'
const githubLink = 'https://github.com/hAxe1/GarageBot/'
const ownerAvatar = 'https://cdn.discordapp.com/avatars/536611897429065728/bc0e0e478353ff53c6e5767c2a342dee.png?size=4096';
const ownerTag = '_hAxel';
const patreonT1 = '1319908356269281330';
const patreonT2 = '1319908356269281330';
const patreonT3 = '1319908356269281330';
const patreonT4 = '1319908356269281330';
const patreonDefault = '1319908356269281330';
const supportServerId = '1254871223985504326';
const botId = '1319140275985317950';

function removeNonIntegers(string){
    return string.replace(/\D/g,'');
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

function errorEmbed(errMsg, useravatar = null, example = null, embedColor = '#ff6961', footerIcon = null, footerText = null){
    //A predefined error embed to use in case there's an error scenario.
    const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setAuthor(
        {
            name: "There was an error",
            iconURL: useravatar
        }
    )
    .setDescription(errMsg);
    if(example) embed.addFields({name: "Example", value: example, inline: false});
    if(footerText && footerIcon) embed.setFooter({ text: footerText, iconURL: footerIcon });

    return embed;
};

function tipsEmbed(tipMsg, embedColor = '#FFFCFF'){
    const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setAuthor(
        {
            name: "Throttle Tips",
            iconURL: 'https://www.pngmart.com/files/6/Light-Bulb-PNG-File.png'
        }
    )
    .setDescription(tipMsg);
    return embed;
}


function isValidHttpUrl(string) {
    //Checks whether the provided string is a valid URL.
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
};

function patreonAdvertEmbed(avatar, title, description, footerIcon, footerText){
    const patreonAdvertisementEmbed = new EmbedBuilder()
    .setAuthor({
        name: title,
        iconURL: avatar
    })
    .setDescription(description+'\n\n"Your support contributes to the bot\'s development and helps maintain its free availability for everyone!".')
    .setImage(patreonBanner)
    .setColor(patreonRedColor)
    .setFooter({
        text: footerText,
        iconURL: footerIcon
    })
    const linksRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setLabel('Patreon')
            .setStyle('Link')
            .setURL(patreonLink)
    );
    return {
        advertEmbed: patreonAdvertisementEmbed,
        buttonsRow: linksRow
    };
}

module.exports = { 
    botName,
    botIcon,
    greenIndicator,
    redIndicator,
    patreonLogChannelId,
    guildJoinLogChannelId,
    guildLeaveLogChannelId,
    embedColor,
    greenColor,
    redColor,
    patreonBanner,
    patreonBannerLarge,
    patreonRedColor,
    patreonBlueColor,
    garageIconExample,
    botInvite,
    botInviteAdmin,
    supportServerInvite,
    patreonLink,
    githubLink,
    ownerAvatar,
    ownerTag,
    patreonT1,
    patreonT2,
    patreonT3,
    patreonT4,
    patreonDefault,
    supportServerId,
    garageEmbedColorExample,
    removeNonIntegers,
    errorEmbed,
    isValidHttpUrl,
    patreonAdvertEmbed,
    tipsEmbed,
    capitalizeFirstLetter
};
