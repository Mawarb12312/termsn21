const {
  Client,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Modal,
  TextInputComponent,
} = require("discord.js");
const settings = require("./settings");

/**
 *
 * @param {Client} client
 */
module.exports = async (client) => {
  // code

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      if (interaction.commandName == "ping") {
        return interaction.reply({
          content: `> Pong :: ${client.ws.ping}`,
        });
      } else if (interaction.commandName == "setup") {
        // code
        let ticketChannel = interaction.guild.channels.cache.get(
          settings.ticketChannel
        );
        if (!ticketChannel) return;

        let embed = new MessageEmbed()
          .setColor(`RANDOM`)
          .setTitle(`${settings.title}`)
          .setDescription(
            `**Click button below to create ticket** || Support ${settings.ticketRoles.map(
              (r) => `<@&${r}>`
            )} will help you in ticket `
          );

        let btnrow = new MessageActionRow().addComponents([
          new MessageButton()
            .setCustomId("ticket_create")
            .setStyle("SECONDARY")
            .setLabel(`Create Ticket`)
            .setEmoji("🎟️"),
        ]);
        await ticketChannel.send({
          embeds: [embed],
          components: [btnrow],
        });

        interaction.reply({
          content: `Trolling ticket will be banned!`,
        });
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId == "ticket_create") {
        const ticket_modal = new Modal()
          .setTitle("Ticket System")
          .setCustomId("ticket_modal");

        const user_name = new TextInputComponent()
          .setCustomId("ticket_username")
          .setLabel(`Your GrowID`.substring(0, 45))
          .setMinLength(3)
          .setMaxLength(50)
          .setRequired(true)
          .setStyle("SHORT");

        const user_product = new TextInputComponent()
          .setCustomId("ticket_product")
          .setLabel(`Name Product ?`.substring(0, 45))
          .setMinLength(3)
          .setMaxLength(50)
          .setRequired(true)
          .setStyle("SHORT");

        const user_value = new TextInputComponent()
          .setCustomId("ticket_value")
          .setLabel(`How many to buy ?`.substring(0, 45))
          .setMinLength(1)
          .setMaxLength(10)
          .setRequired(true)
          .setStyle("SHORT");

        const row_username = new MessageActionRow().addComponents(user_name);
        const row_user_product = new MessageActionRow().addComponents(
          user_product
        );
        const row_user_value = new MessageActionRow().addComponents(user_value);
        ticket_modal.addComponents(
          row_username,
          row_user_product,
          row_user_value
        );

        await interaction.showModal(ticket_modal);
      } else if (interaction.customId == "ticket_delete") {
        let ticketname = `ticket-${interaction.user.id}`;
        let oldChannel = interaction.guild.channels.cache.find(
          (ch) => ch.name == ticketname
        );
        if (!oldChannel) return;
        interaction.reply({
          content: `${settings.up} | Thank you, Your ticket deleting in few seconds`,
        });
        setTimeout(() => {
          oldChannel.delete().catch((e) => {});
        }, 5000);
      }
    }

    if (interaction.isModalSubmit()) {
      const ticket_username =
        interaction.fields.getTextInputValue("ticket_username");
      const ticket_user_product =
        interaction.fields.getTextInputValue("ticket_product");
      const ticket_user_value =
        interaction.fields.getTextInputValue("ticket_value");

      let ticketname = `ticket-${interaction.user.id}`;
      await interaction.guild.channels
        .create(ticketname, {
          type: "GUILD_TEXT",
          topic: `ticket of ${interaction.user.tag}`,
          parent: settings.ticketCategory || interaction.channel.parentId,
          permissionOverwrites: [
            {
              id: interaction.guildId,
              deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
            },
            {
              id: interaction.user.id,
              allow: [
                "VIEW_CHANNEL",
                "SEND_MESSAGES",
                "READ_MESSAGE_HISTORY",
                "EMBED_LINKS",
                "ATTACH_FILES",
                "MANAGE_CHANNELS",
                "ADD_REACTIONS",
                "USE_APPLICATION_COMMANDS",
              ],
            },
            {
              id: client.user.id,
              allow: ["ADMINISTRATOR", "MANAGE_CHANNELS"],
            },
          ],
        })
        .then(async (ch) => {
          let embed = new MessageEmbed()
            .setColor(`RANDOM`)
            .setTitle(`${settings.title}`)
            .addFields([
              {
                name: `${settings.bot} | GrowID`,
                value: `${settings.panah} **${ticket_username}**`,
              },
              {
                name: `${settings.product} | Product to buy`,
                value: `${settings.panah} ${ticket_user_product}`,
              },
              {
                name: `${settings.up} | Value to buy`,
                value: `${settings.panah} ${ticket_user_value}`,
              },
              {
                name: `Note`,
                value: `${settings.discord} **Ticket don't have any transcript**`,
              },
            ]);

          let btnrow = new MessageActionRow().addComponents([
            new MessageButton()
              .setCustomId(`ticket_delete`)
              .setStyle("DANGER")
              .setLabel(`Delete Ticket`)
              .setEmoji("🔖"),
          ]);
          ch.send({
            content: `${settings.bot} Ticket by : ${interaction.member} || ${
              settings.list
            } Support : ${settings.ticketRoles.map((r) => `<@&${r}>`)}`,
            embeds: [embed],
            components: [btnrow],
          });
          interaction.reply({
            content: `${settings.verif} | Your Ticket Created in ${ch}`,
            ephemeral: true,
          });
        })
        .catch((e) => {
          interaction.reply({
            content: `${settings.no} | Error \n \`${e.message}\``,
            ephemeral: true,
          });
        });
    }
  });
};
