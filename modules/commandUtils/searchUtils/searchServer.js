const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const { botInvite, supportServerInvite, githubLink, ownerTag, ownerAvatar, errorEmbed} = require('../../utility.js');
const { searchExit } = require('./searchExit.js')
const garageSchema = require('../../../mongodb_schema/garageSchema.js');
const { searchSelection } = require('./searchSelection.js');
const { displaySearchedVehicle } = require('./displaySearchedVehicle.js');

async function searchServer(
    interaction,
    initiatorData,
    guildData,
    footerData,
    embedColor,
    searchTerm
){
    
    //Initiator Details
    const initiatorAvatar = initiatorData.displayAvatarURL({ dynamic: true });
    const initiatorUsername = initiatorData.username;
    const initiatorId = initiatorData.id;
    
    //Guild Details
    const guildId = guildData.id;
    const guildName = guildData.name;
    const guildIcon = guildData.iconURL({ dynamic: true });	

    //Filter
    const buttonFilter = i => i.user.id === initiatorId && i.guild.id === guildId;
    
     //Misc
     const mainInteractionId = interaction.id;

    //Search term returned no results.
    //User can search globally in this case.

    const searchData = await garageSchema.find( { vehicle: { $regex: searchTerm , $options : 'i'} , guildId: guildId} )
    
    if(!searchData || searchData?.length === 0){
        const searchGlobalData = await garageSchema.find( { vehicle: { $regex: searchTerm , $options : 'i'} } );

        const searchGlobalButton = new ButtonBuilder()
        .setCustomId(`searchGlobal+${mainInteractionId}`)
        .setLabel('Search Globally')
        .setStyle('Secondary');
        const exitButton = new ButtonBuilder()
        .setCustomId(`searchExit+${mainInteractionId}`)
        .setLabel('Exit')
        .setStyle('Danger');

        if(searchGlobalData && searchGlobalData.length > 0){
            const row = new ActionRowBuilder() 
            .addComponents(exitButton);
            await interaction.editReply({
                embeds:[errorEmbed(`The server-wide search returned no results.`,initiatorAvatar)],
                components: [row]
            });
            //Globally ${searchGlobalData.length.toLocaleString()} results were found. Click on the **Search Global** button to view them.
            //Setup await interaction for the button and route to search global.
        }else{
            const row = new ActionRowBuilder() 
            .addComponents(exitButton);
            await interaction.editReply({
                embeds:[errorEmbed(`The server-wide search returned no results.`,initiatorAvatar)],
                components: [row]
            });
        };

        //Checking for the button responses, if any.
        const buttonCollected = await interaction.channel.awaitMessageComponent({ filter: buttonFilter, ComponentType: ComponentType.Button, time: 60000, max: 1 })
        .catch(e => {});

        if(!buttonCollected){
            await interaction.deleteReply();
            return; 
        };
        const buttonId = buttonCollected.customId;
        switch(buttonId){
            case `searchGlobal+${mainInteractionId}`:
                searchGlobal();
                break;
            case `searchExit+${mainInteractionId}`:
                searchExit(interaction);
                break;
        };
        return;
    };

    const selectedVehicle = await searchSelection(
        interaction,
        guildData,
        initiatorData,
        footerData,
        embedColor,
        searchTerm,
        searchData,
        'server'
    );
    displaySearchedVehicle(
        interaction,
        guildData,
        initiatorData,
        footerData,
        embedColor,
        searchTerm,
        searchData,
        'server',
        selectedVehicle
    );
};

module.exports = {
    searchServer    
};
