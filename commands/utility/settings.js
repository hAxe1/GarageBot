const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { obtainGuildProfile, defaultEmbedColor, obtainAllUserVehicles, obtainUserProfile } = require('../../modules/database.js');
const {  errorEmbed, removeNonIntegers, tipsEmbed, patreonAdvertEmbed } = require('../../modules/utility.js');
const garageSchema = require('../../mongodb_schema/garageSchema.js');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('View your garage.'),
	

	async execute(interaction) {
		//Defining user details.
		await interaction.deferReply({ ephemeral: false })
		const initiatorId = interaction.user.id;
		const initiatorUsername = interaction.user.username;
		const initiatorAvatar = interaction.user.displayAvatarURL({ dynamic: true });
		const userDetails = interaction.user;
		const userId = userDetails.id;
		const username = userDetails.username;
		const userAvatar = userDetails.displayAvatarURL({ dynamic: true });
		const userTag = userDetails.tag;
		//User Profile 
		const userProfile = await obtainUserProfile(userId);
		const premiumUser = userProfile?.premiumUser;
		const premiumTier = userProfile?.premiumTier;
		let garageThumbnail = userProfile?.garageThumbnail;

		//Guild information
		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const guildIcon = interaction.guild.iconURL({ dynamic: true });	

		//Guild Profile
		const guildProfile = await obtainGuildProfile(guildId);
		if(!guildProfile){
			interaction.editReply({
				embeds: [errorEmbed('Server profile not setup, please kick the bot and invite it again.', initiatorAvatar)]
			});
			return;
		};
		const verificationChannelId = guildProfile.verificationChannelId;
		const guideChannelId = guildProfile.guideChannelId;
		const loggingChannelId = guildProfile.loggingChannelId;
		const syncEnabled = guildProfile.syncEnabled;
		const syncedGuildId = guildProfile.syncedGuildId;
		let footerIcon = guildProfile.customFooterIcon || guildIcon;
		const footerText = `${guildName} • Vehicle Verification`
		const guildToFetchInfoFrom = syncedGuildId || guildId
		//Misc
		const messageFilter = (m) => m.author.id === initiatorId;
		const embedColor = await defaultEmbedColor(userId);
		const mainInteractionId = interaction.id;

		//Garage data for specified user.
		const garageData = await obtainAllUserVehicles(userId, guildToFetchInfoFrom);

		async function buildSettingsDashboard(selectedOption){
			const selectedVehicle = garageData[parseInt(selectedOption) - 1];
			const vehicleName = selectedVehicle.vehicle;
			const vehicleImages = selectedVehicle.vehicleImages;
			const vehicleDescription = selectedVehicle.vehicleDescription;
			const vehicleEmbedColor = selectedVehicle.embedColor || embedColor;
			const settingsDashboard = new EmbedBuilder()
			.setAuthor({
				name: `${vehicleName} - Driven By ${userTag}`,
				iconURL: userAvatar
			})
            .setDescription(`On this dashboard, you can upload images to the vehicle you selected, remove any you wish or reset them entirely.`)
			.setColor(vehicleEmbedColor)
			.setImage(vehicleImages[0])
			.setFooter({
				text: `${guildName} • Settings Dashboard`,
				iconURL: footerIcon
			})
            let componentsArray = [];
			const row = new ActionRowBuilder() 
			const previousButton = new ButtonBuilder()
			.setCustomId(`uploadImage+${mainInteractionId}`)
			.setLabel('Upload')
			.setStyle('Primary');
			const nextButton = new ButtonBuilder()
			.setCustomId(`deleteImage+${mainInteractionId}`)
			.setLabel('Delete')
			.setStyle('Primary');
            const resetButton = new ButtonBuilder()
			.setCustomId(`resetImages+${mainInteractionId}`)
			.setLabel('Remove All Images')
			.setStyle('Primary');
            const backButton = new ButtonBuilder()
			.setCustomId(`deleteCar+${mainInteractionId}`)
			.setLabel('Delete Car')
			.setStyle('Primary');
            const exitButton = new ButtonBuilder()
			.setCustomId(`exit+${mainInteractionId}`)
			.setLabel('Exit')
			.setStyle('Danger');
            row.addComponents(previousButton).addComponents(nextButton).addComponents(resetButton).addComponents(backButton).addComponents(exitButton);
				componentsArray = [row];
			await interaction.editReply({
				embeds: [settingsDashboard],
				components: componentsArray
			});
			const buttonFilter = (ButtonInteraction) => ButtonInteraction.componentType === 2 && ButtonInteraction.user.id === initiatorId;
            const buttonCollector = interaction.channel.createMessageComponentCollector({ 
                filter:buttonFilter,
                time: 600000 }); 
            buttonCollector.on('collect', async (collected) => {
                const buttonId = collected.customId;
                switch(buttonId){
                    case `uploadImage+${mainInteractionId}`:
                        async function uploadImage(){
							await collected.deferUpdate();
                            const uploadEmbed = new EmbedBuilder()
                            .setAuthor({
                                name: `Upload your image for ${vehicleName}.`,
                                iconURL: userAvatar
                            })
                            .setDescription(`Attach your image to a post in this channel`)
                            .setColor(embedColor)
                            .setFooter({
                                text: footerText,
                                iconURL: footerIcon
                            });
                            if(garageThumbnail) uploadEmbed.setThumbnail(garageThumbnail);
                    
                            await interaction.editReply({
                                embeds: [uploadEmbed]
                            });
                            const messageCollector = interaction.channel.createMessageCollector({ filter: messageFilter, time: 60000, max: 1});
                            messageCollector.on('collect', async (collectedMessage) => {
                                const [vehicleAttachmentData] = collectedMessage.attachments.values();
								if(!vehicleAttachmentData){
									await interaction.editReply({
									embeds: [errorEmbed('You did not provide an attachment.', initiatorAvatar)],
									components: []
									});
									messageCollector.stop();
									return;
								};	
                                messageCollector.stop();
                                const vehicleImageURL = vehicleAttachmentData.url;
                                const vehicleImageProxyURL = vehicleAttachmentData.proxyURL;
                                const vehicleImageSize = vehicleAttachmentData.size;
                                const vehicleImageName = vehicleAttachmentData.name;
                                const vehicleImageType = vehicleAttachmentData.contentType;

                                //If the attachment is greater than 8mb.

                                if(vehicleImageSize > 8000000){
                                    await interaction.editReply({
                                        embeds: [errorEmbed('The attachment you provided is too big, it must be under `8mb`', initiatorAvatar)],
                                        components: [],
                                        ephemeral: true
                                    });
                                    return;
                                };
                                //If the provided attachment is not an image.
                                if(vehicleImageType){
                                    if(!vehicleImageType.includes('image')){
                                        await interaction.editReply({
                                            embeds: [errorEmbed('The attachment you provided does not seem to be a valid image.', initiatorAvatar)],
                                            components: [],
                                            ephemeral: true
                                        });
                                        return;
                                    };
                                };

                                if(vehicleImageName.includes('heic')){
                                    await interaction.editReply({
                                        embeds: [errorEmbed('`HEIC` Images are not supported on Discord.\nPlease try to take a screenshot of the image and verifying again with the screenshot instead.', initiatorAvatar)],
                                        components: [],
                                        ephemeral: true
                                    });
                                    return;
                                };
                                await garageSchema.updateOne({guildId: guildId, userId: userId, vehicle: vehicleName }, {$push: {vehicleImages: vehicleImageProxyURL }})
                                .catch(async e => {
                                    await interaction.editReply({
                                        embeds: [errorEmbed(e, initiatorAvatar)],
                                        components: []
                                    })
									
                                    return;
                                });
								const uploadSuccess = new EmbedBuilder()
								.setAuthor({
									name: `Image updated for ${vehicleName}.`,
									iconURL: userAvatar
								})
								.setDescription(`${vehicleImageName} added tp ${vehicleName}`)
								.setColor(embedColor)
								.setFooter({
									text: footerText,
									iconURL: footerIcon
								})
								await interaction.editReply({
									embeds: [uploadSuccess],
									components: []
								})
                            })                    
							return;	
                        

                        };
                        uploadImage();
                        break;
					case `deleteImage+${mainInteractionId}`:
						await collected.deferUpdate();
						async function deleteImage() {
							// Fetch the list of image names from the database
							const vehicleData = await garageSchema.findOne({ guildId: guildId, userId: userId, vehicle: vehicleName });
							if (!vehicleData || !vehicleData.vehicleImages || vehicleData.vehicleImages.length === 0) {
								await interaction.editReply({
									embeds: [errorEmbed('No images found for this vehicle.', initiatorAvatar)],
									components: [],
									ephemeral: true
								});
								return;
							}
					
							let currentIndex = 0;
					
							const updateImageEmbed = async () => {
								const image = vehicleData.vehicleImages[currentIndex];
								const filename = image.substring(image.lastIndexOf('/') + 1, image.indexOf('?'));
					
								const imageEmbed = new EmbedBuilder()
									.setTitle(`Image ${currentIndex + 1} for ${vehicleName}`)
									.setDescription(`Filename: ${filename}`)
									.setImage(image)
									.setColor(embedColor);
					
								const row = new ActionRowBuilder()
									.addComponents(
										new ButtonBuilder()
											.setCustomId(`previousImage+${mainInteractionId}`)
											.setLabel('Previous')
											.setStyle('Primary')
											.setDisabled(currentIndex === 0),
										new ButtonBuilder()
											.setCustomId(`nextImage+${mainInteractionId}`)
											.setLabel('Next')
											.setStyle('Primary')
											.setDisabled(currentIndex === vehicleData.vehicleImages.length - 1),
										new ButtonBuilder()
											.setCustomId(`deleteImage+${mainInteractionId}`)
											.setLabel('Delete')
											.setStyle('Danger'),
										new ButtonBuilder()
											.setCustomId(`exit+${mainInteractionId}`)
											.setLabel('Exit')
											.setStyle('Secondary')
									);
					
								await interaction.editReply({
									embeds: [imageEmbed],
									components: [row]
								});
							};
					
							await updateImageEmbed();
					
							const buttonFilter = (buttonInteraction) => buttonInteraction.customId.includes(mainInteractionId) && buttonInteraction.user.id === initiatorId;
							const buttonCollector = interaction.channel.createMessageComponentCollector({
								filter: buttonFilter,
								time: 60000
							});
					
							buttonCollector.on('collect', async (buttonInteraction) => {
								const buttonId = buttonInteraction.customId;
					
								if (buttonId === `previousImage+${mainInteractionId}`) {
									currentIndex = Math.max(currentIndex - 1, 0);
									await buttonInteraction.deferUpdate();
									await updateImageEmbed();
								} else if (buttonId === `nextImage+${mainInteractionId}`) {
									currentIndex = Math.min(currentIndex + 1, vehicleData.vehicleImages.length - 1);
									await buttonInteraction.deferUpdate();
									await updateImageEmbed();
								} else if (buttonId === `deleteImage+${mainInteractionId}`) {
									const imageToDelete = vehicleData.vehicleImages[currentIndex];
									const filenameToDelete = imageToDelete.substring(imageToDelete.lastIndexOf('/') + 1, imageToDelete.indexOf('?'));
					
									await garageSchema.updateOne(
										{ guildId: guildId, userId: userId, vehicle: vehicleName },
										{ $pull: { vehicleImages: imageToDelete } }
									);
					
									vehicleData.vehicleImages.splice(currentIndex, 1);
					
									if (vehicleData.vehicleImages.length === 0) {
										await interaction.editReply({
											embeds: [new EmbedBuilder().setDescription(`All images deleted for ${vehicleName}.`)],
											components: []
										});
										buttonCollector.stop();
										return;
									}
					
									currentIndex = Math.min(currentIndex, vehicleData.vehicleImages.length - 1);
									//await buttonInteraction.editReply();
									await updateImageEmbed();
								} else if (buttonId === `exit+${mainInteractionId}`) {
									await interaction.editReply({
										embeds: [new EmbedBuilder().setDescription(`Exited image deletion for ${vehicleName}.`)],
										components: []
									});
									buttonCollector.stop();
								}
							});
					
							buttonCollector.on('end', async () => {
								await interaction.editReply({
									embeds: [new EmbedBuilder().setDescription(`Image deletion session ended for ${vehicleName}.`)],
									components: []
								});
							});
						}
						await deleteImage();
						break;
					case `resetImages+${mainInteractionId}`:
						await collected.deferUpdate();
						async function resetImages() {
							// Warn the user that all their images will be erased and ask for confirmation
							const confirmEmbed = new EmbedBuilder()
								.setTitle('Confirm Reset')
								.setDescription('Are you sure you want to delete all images for this vehicle? This action cannot be undone.')
								.setColor(15548997);
					
							const row = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`confirmReset+${mainInteractionId}`)
										.setLabel('Yes')
										.setStyle('Danger'),
									new ButtonBuilder()
										.setCustomId(`cancelReset+${mainInteractionId}`)
										.setLabel('No')
										.setStyle('Secondary')
								);
					
							await interaction.editReply({
								embeds: [confirmEmbed],
								components: [row]
							});
					
							const buttonFilter = (buttonInteraction) => buttonInteraction.customId.includes(mainInteractionId) && buttonInteraction.user.id === initiatorId;
							const buttonCollector = interaction.channel.createMessageComponentCollector({
								filter: buttonFilter,
								time: 60000
							});
					
							buttonCollector.on('collect', async (buttonInteraction) => {
								const buttonId = buttonInteraction.customId;
					
								if (buttonId === `confirmReset+${mainInteractionId}`) {
									// Delete all images
									await garageSchema.updateOne(
										{ guildId: guildId, userId: userId, vehicle: vehicleName },
										{ $set: { vehicleImages: [] } }
									);
					
									await buttonInteraction.update({
										embeds: [new EmbedBuilder().setDescription(`All images deleted for ${vehicleName}.`).setColor(5763719)],
										components: []
									});
									buttonCollector.stop();
								} else if (buttonId === `cancelReset+${mainInteractionId}`) {
									await buttonInteraction.update({
										embeds: [new EmbedBuilder().setDescription(`Image reset canceled for ${vehicleName}.`).setColor(16705372)],
										components: []
									});
									buttonCollector.stop();
								}
							});
					
							buttonCollector.on('end', async () => {
								await interaction.editReply({
									embeds: [new EmbedBuilder().setDescription(`Image reset session ended for ${vehicleName}.`).setColor(16705372)],
									components: []
								});
							});
						}
						await resetImages();
						break;
					case `deleteCar+${mainInteractionId}`:
						await collected.deferUpdate();
						async function deleteCar() {
							// Warn the user about the deletion and ask for confirmation
							const confirmEmbed = new EmbedBuilder()
								.setTitle('Confirm Car Deletion')
								.setDescription('Are you sure you want to delete this car? This action cannot be undone.')
								.setColor(15548997);
					
							const row = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`confirmDeleteCar+${mainInteractionId}`)
										.setLabel('Yes')
										.setStyle('Danger'),
									new ButtonBuilder()
										.setCustomId(`cancelDeleteCar+${mainInteractionId}`)
										.setLabel('No')
										.setStyle('Secondary')
								);
					
							await interaction.editReply({
								embeds: [confirmEmbed],
								components: [row]
							});
					
							const buttonFilter = (buttonInteraction) => buttonInteraction.customId.includes(mainInteractionId) && buttonInteraction.user.id === initiatorId;
							const buttonCollector = interaction.channel.createMessageComponentCollector({
								filter: buttonFilter,
								time: 60000
							});
					
							buttonCollector.on('collect', async (buttonInteraction) => {
								const buttonId = buttonInteraction.customId;
					
								if (buttonId === `confirmDeleteCar+${mainInteractionId}`) {
									// Delete the car
									await garageSchema.deleteOne(
										{ guildId: guildId, userId: userId, vehicle: vehicleName }
									);
					
									await buttonInteraction.update({
										embeds: [new EmbedBuilder().setDescription(`Car ${vehicleName} deleted.`).setColor(5763719)],
										components: []
									});
									buttonCollector.stop();
								} else if (buttonId === `cancelDeleteCar+${mainInteractionId}`) {
									await buttonInteraction.update({
										embeds: [new EmbedBuilder().setDescription(`Car deletion canceled for ${vehicleName}.`).setColor(16705372)],
										components: []
									});
									buttonCollector.stop();
								}
							});
					
							buttonCollector.on('end', async () => {
								await interaction.editReply({
									embeds: [new EmbedBuilder().setDescription(`Car deletion session ended for ${vehicleName}.`).setColor(16705372)],
									components: []
								});
							});
						}
						await deleteCar();
						break;
					case `exit+${mainInteractionId}`:
						await interaction.editReply({
							embeds: [new EmbedBuilder().setDescription(`Settings session for ${username} complete.`).setColor(16705372)],
							components: []
						});
						break;
                };
            });

		};


		if(!garageData || garageData?.length === 0){
			let errEmbed;
			if(userId === initiatorId){
				errEmbed = errorEmbed(`**${username},**\nYou do not have any verified rides, Please visit the <#${guideChannelId}> channel (check the pins) to get started!`, initiatorAvatar)
			}
			await interaction.editReply({
				embeds:[errEmbed]
			});
			return;
		};
		if(garageData.length === 1){
			buildSettingsDashboard(1);
		}
		
		const garageOutput = garageData.map((x,y) => {
			if(x.vehicleImages.length > 0){
				return `\`${y+1}.\` [${x.vehicle}](${x.vehicleImages[0]})`
			}else{
				return `\`${y+1}.\` ${x.vehicle}`
			};
		});

		const garageEmbed = new EmbedBuilder()
		.setAuthor({
			name: `${userTag}'s Garage`,
			iconURL: userAvatar
		})
		.setDescription(`Please type the number corresponding the vehicle you would like to edit.\n${garageOutput.join('\n')}`)
		.setColor(embedColor)
		.setFooter({
			text: footerText,
			iconURL: footerIcon
		});
		if(garageThumbnail) garageEmbed.setThumbnail(garageThumbnail);

		await interaction.editReply({
			embeds: [garageEmbed]
		});

		const allowedResponses = Array.from(Array(garageData.length + 1).keys()).slice(1).map(x => `${x}`);
		const messageCollector = interaction.channel.createMessageCollector({ filter: messageFilter, time: 60000, max: 3});
		messageCollector.on('collect', async (collectedMessage) => {
			const messageContent = collectedMessage.content;
			const selectedOption = removeNonIntegers(messageContent);
			if(!allowedResponses.includes(selectedOption)) return;
			messageCollector.stop();
			collectedMessage.delete();
			buildSettingsDashboard(selectedOption);

			
		});

		messageCollector.on('end', async (collected) => {
			/*
			Checking if there were no responses collected 
			Or if the responses that were collected are invalid.
			*/
			const collectedResponses = collected.map(x => x.content);
			const whetherAllInvalidResponses = collectedResponses.every(x => {
				return !allowedResponses.includes(x);
			});
			if(whetherAllInvalidResponses){
				garageEmbed.setDescription(garageOutput.join('\n'))
				await interaction.editReply({
					embeds: [garageEmbed]
				});
				return;
			}
		});
		
	},

    
}; 
