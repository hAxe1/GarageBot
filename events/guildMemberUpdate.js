const { obtainUserProfile } = require('../modules/database.js');
const { patreonLogChannelId, botIcon, patreonT1, patreonT2, patreonT3, patreonT4, patreonDefault, patreonRedColor, supportServerId } = require('../modules/utility.js');
const { EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const userProfileSchema = require('../mongodb_schema/userProfileSchema.js');


module.exports = {
	name: 'guildMemberUpdate',
	async execute(oldMember, newMember) {
		if(oldMember.user.bot) return;
        const guildId = newMember.guild.id;
        if(guildId !== supportServerId) return;
        const userId = newMember.user.id;
        const userTag = newMember.user.tag
        const oldRoles = oldMember._roles;
        const newRoles = newMember._roles;
        const rolesChanged = newRoles.filter(val => !oldRoles.includes(val));
        const patreonLogChannel = await newMember.client.channels.fetch(patreonLogChannelId);	
        rolesChanged.map(async role => {
            if([patreonT1, patreonT2, patreonT3, patreonT4].includes(role)){
                const userProfile = await obtainUserProfile(userId);
                if(!userProfile){
                    const newUserProfile = new userProfileSchema({
                        _id: mongoose.Types.ObjectId(),
                        userId: applicantId,
                        premiumUser: false,
                        premiumTier: 0,
                        embedColor: '',
                        garageThumbnail: ''
                    });
                    await newUserProfile.save()
                    .catch(async err => {
                        console.log(err);
                    });
                };
                const patreonLogEmbed = new EmbedBuilder()
                .setTitle('New Patron Registered')
                .setDescription("A new patron was registered into the database.")
                .addFields({name: 'User', value: `${userTag} | <@${userId}>`, inline: true})
                .setColor(patreonRedColor)
                .setFooter({
                    text: 'ThrottleBot Vehicle Verification',
                    iconURL: botIcon
                });
                if(role === patreonT1){
                    await userProfile.updateOne({ userId: userId }, { $set: {premiumUser: true, premiumTier: 1} })
                    patreonLogEmbed.addFields({name: 'Tier', value: `<@&${patreonT1}>`, inline: true});
                }else if(role === patreonT2){
                    await userProfile.updateOne({ userId: userId }, { $set: {premiumUser: true, premiumTier: 2} })
                    patreonLogEmbed.addFields({name:'Tier', value: `<@&${patreonT2}>`, inline: true});
                }else if(role === patreonT3){
                    await userProfile.updateOne({ userId: userId }, { $set: {premiumUser: true, premiumTier: 3} })
                    patreonLogEmbed.addFields({name: 'Tier', value: `<@&${patreonT3}>`, inline: true});
                }else if(role === patreonT4){
                    await userProfile.updateOne({ userId: userId }, { $set: {premiumUser: true, premiumTier: 4} })
                    patreonLogEmbed.addFields({name: 'Tier', value: `<@&${patreonT4}>`, inline: true});
                };
                patreonLogChannel.send({
                    embeds: [patreonLogEmbed]
                });
            };
        });
	},
};