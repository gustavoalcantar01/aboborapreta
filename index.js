// https://simplediscord.site

// Importing dependencies
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import axios from 'axios';
import {
  JsonDatabase
} from "wio.db";
import {
  SelfBot,
  Checker,
  Raid,
  GuildCloner
} from "@simplelib/self";
const config = new JsonDatabase({
  databasePath: "./config.json"
})

const self = new SelfBot(process.env.TOKEN);

import { joinVoiceChannel } from '@discordjs/voice';

let call;

async function joinCall(channelId, guild) {
  const connection = joinVoiceChannel({
    channelId: channelId,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  call = connection;
}

async function leaveCall() {
  if (call) {
    call.destroy();
  }
}

// Show Message ACSI in the console
const show = (self) => {
  console.log(`
    ██████╗ ██╗   ██╗ ██████╗  ██╗  ██╗ ███████╗ ██████╗
    ██╔════╝ ╚██╗ ██╔╝ ██╔══██╗ ██║  ██║ ██╔════╝ ██╔══██╗
    ██║       ╚████╔╝  ██████╔╝ ███████║ █████╗   ██████╔╝
    ██║        ╚██╔╝   ██╔═══╝  ██╔══██║ ██╔══╝   ██╔══██╗
    ╚██████╗    ██║    ██║      ██║  ██║ ███████╗ ██║  ██║
    ╚═════╝    ╚═╝    ╚═╝      ╚═╝  ╚═╝ ╚══════╝ ╚═╝  ╚═╝

    `)
  console.log(`UserName: ${self.user.username}\nId: ${self.user.id}`)
}

self.on("ready", () => show(self))

self.on("messageCreate", async (msg) => {
  const prefix = config.get("prefix") || "!";

  if (!msg.content.startsWith(prefix)) return;
  const [command, ...args] = msg.content.slice(prefix.length).trim().split(/\s+/);

  if (command === `ping`) {
    msg.reply({ content: `${self.ws.ping}ms` })
  }

  if (msg.author.id !== self.user.id && !config.get("permscomandos")?.includes(msg.author.id)) return;

  if (!msg.content.includes(`ping`)) msg.delete();

  switch (command) {
    case "entrarcall":
      await joinCall(config.get("call"), msg.guild);
      break;

    case "saircall":
      await leaveCall();
      break;

    case "setcall":
      if (args.length > 0) {
        config.set("call", args[0]);
      }
      break;

    case "setprefix":
      if (args.length > 0) {
        config.set("prefix", args[0]);
      }
      break;

    case "raid":
      const raid = new Raid(self, msg.guild.id);
      await raid.attack();
      break;

    case "cc":
      const raidCreate = new Raid(self, msg.guild.id);
      await raidCreate.createChannels();
      break;

    case "spam":
      const raidSpam = new Raid(self, msg.guild.id);
      await raidSpam.spam(msg.channel);
      break;

    case "cls":
      await self.clearMessages(msg.channel.id, false);
      break;

    case "els":
      await self.editMessages(msg.channel.id, "k", true);
      break;

    case "cdm":
      await self.closeDm(msg.channel.id);
      break;

    case "quitAllServers":
      await self.exitAllServers(true);
      break;

    case "unfriend":
      await self.removeFriends(false);
      break;

    case "permadd":
      if (args.length > 0) {
        config.push("permscomandos", args[0]);
      }
      break;

    case "permrem":
      if (args.length > 0) {
        config.pull("permscomandos", (x) => x === args[0]);
      }
      break;

    case "help":
      try {
        const helpMessage = `
      **📜 Comandos do Selfbot**
      Aqui estão os comandos disponíveis:
      
      **🔹 entrarcall**  
      Entre na call setada na database.
      
      **🔹 saircall**  
      Saia da call setada na database.
      
      **🔹 setcall**  
      Sete a call na database.

      **🔹 setprefix**  
      Sete o prefixo na database.
      
      **🔹 raid**  
      Realize um raid no servidor que o comando for usado.
      
      **🔹 cc**  
      Crie 10 canais no servidor.

      **🔹 spam**  
      Mande 10 mensagens em todos os canais do servidor.

      **🔹 cdm**  
      Delete o canal ou feche uma dm.
      
      **🔹 cls**  
      Apague todas as suas mensagens no canal.

      **🔹 els**  
      Edite todas as suas mensagens no canal.

      **🔹 quitAllServers**  
      Saia de todos os seus servidores.

      **🔹 unfriend**  
      Desfaça todas as suas amizades.

      **🔹 permadd**  
      Adicione permissão a um usuário.
      
      **🔹 permrem**  
      Remova permissão de um usuário.

      **🔹 help**  
      Exibe esta mensagem de ajuda.
      
      *Selfbot by [simplediscord](https://simplediscord.site)*`;

        await msg.channel.send(helpMessage);
      } catch (error) {
        console.error("Erro ao enviar o comando help:", error);
      }
      break;
  }
});