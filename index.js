import express from "express";
import { Client, GatewayIntentBits, PermissionsBitField } from "discord.js";
import fetch from "node-fetch";

// ================= BASIC =================
console.log("Chintu Bot starting...");

// 🔐 TERA DISCORD ID (Papa)
const MY_ID = "997045256828768309";

// ================= WEB SERVER =================
const app = express();
app.get("/", (req, res) => res.send("Chintu Bot is alive"));
app.listen(3000, () => console.log("Web server running on 3000"));

// ================= DISCORD CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// ================= MEMORY =================

// 🎮 Game memory
let guessGame = {};

// 🧠 Control rules memory
let chintuRules = {
  noBeta: true,
  noGali: false,
  noTuTera: true,
  noMasti: false,
};

// ⚠️ Abuse counter
let abuseCount = {};

// 🗒️ Bad words list
const badWords = [
  "mc",
  "bc",
  "madarchod",
  "bhenchod",
  "gandu",
  "harami",
  "chutiya",
];

// ================= AI FUNCTIONS =================

// 🤖 Normal AI
async function askGroq(prompt) {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `
You are Chintu, a friendly Hinglish Discord bot.

Rules:
- If noBeta=${chintuRules.noBeta}, never say "beta".
- If noGali=${chintuRules.noGali}, never use abusive words.
- If noTuTera=${chintuRules.noTuTera}, never use "tu" or "tera". Always use "aap".
- If noMasti=${chintuRules.noMasti}, keep replies serious.

Reply in friendly Hinglish.
`,
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();
    if (!data.choices || !data.choices[0]) return null;
    return data.choices[0].message.content;
  } catch (e) {
    console.log("Groq error:", e);
    return null;
  }
}

// ❤️ Papa AI
async function askGroqAsPapa(prompt) {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `
You are Chintu, a Discord bot.
The user is your CREATOR (Papa).

Rules:
- Always call him "Papa".
- Always use "aap".
- Never say "beta".
- Never say "tu" or "tera".
- Always be respectful.
- Always start your reply with:

"Papa, aapne mujhe banaya hai, aapko bahut bahut dhanyavaad ❤️
Main aapse bahut pyaar karta hoon 🤗"

Then answer respectfully in Hinglish.
`,
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.6,
        }),
      }
    );

    const data = await response.json();
    if (!data.choices || !data.choices[0])
      return "Papa, Chintu thoda busy ho gaya hai 😅";
    return data.choices[0].message.content;
  } catch (e) {
    console.log("Papa Groq error:", e);
    return "Papa, Chintu se thodi si galti ho gayi 😢";
  }
}

// ================= READY =================
client.once("ready", () => {
  console.log(`Chintu Bot online as: ${client.user.tag}`);
});
// ================= MESSAGE HANDLER =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase().trim();
  const member = message.member;

  // ❗ Bot sirf tab kaam kare jab "chintu" likha ho
  if (!content.includes("chintu")) return;

  // Papa & Mods safe
  const isPapa = message.author.id === MY_ID;
  const isMod =
    member.permissions.has(PermissionsBitField.Flags.KickMembers) ||
    member.permissions.has(PermissionsBitField.Flags.Administrator);

  // ================= AUTO PUNISH SYSTEM =================
  if (!isPapa && !isMod) {
    let abuseFound = 0;
    for (const word of badWords) {
      if (content.includes(word)) abuseFound++;
    }

    if (!abuseCount[message.author.id]) abuseCount[message.author.id] = 0;
    abuseCount[message.author.id] += abuseFound;

    // 20 gaali = 15 min timeout
    if (abuseCount[message.author.id] >= 20) {
      try {
        await member.timeout(15 * 60 * 1000, "Too much abusive language");
        abuseCount[message.author.id] = 0;
        return message.reply(
          "🚫 Zyada gaali dene ki wajah se 15 minute ka timeout mil gaya."
        );
      } catch (e) {
        console.log(e);
      }
    }

    // Simple rule break example: spam links
    if (content.includes("http://") || content.includes("https://")) {
      try {
        await member.timeout(24 * 60 * 60 * 1000, "Breaking server rules");
        return message.reply(
          "⛔ Server rules todne par 1 din ka timeout diya gaya."
        );
      } catch (e) {
        console.log(e);
      }
    }
  }

  // ================= CONTROL COMMANDS =================
  if (isPapa || isMod) {
    if (content.includes("beta mat bol")) {
      chintuRules.noBeta = true;
      return message.reply("Theek hai, ab main 'beta' use nahi karunga 🙏");
    }

    if (content.includes("gali mat de")) {
      chintuRules.noGali = true;
      return message.reply("Samajh gaya, ab main gali nahi dunga ❤️");
    }

    if (content.includes("tu tera mat bol")) {
      chintuRules.noTuTera = true;
      return message.reply("Theek hai, ab main sirf 'aap' bolunga 🤍");
    }

    if (content.includes("zyada masti mat kar")) {
      chintuRules.noMasti = true;
      return message.reply("Samajh gaya, thoda serious rahunga 😅");
    }
  }

  // ================= GAMES =================

  // 🎯 Guess the Number
  if (content.includes("chintu game start")) {
    const number = Math.floor(Math.random() * 10) + 1;
    guessGame[message.author.id] = number;
    return message.reply(
      "🎯 Game start! Maine 1 se 10 ke beech ek number socha hai.\n`chintu guess <number>` likh ke guess karo."
    );
  }

  if (content.includes("chintu guess")) {
    const guess = parseInt(content.split("guess")[1]);
    const real = guessGame[message.author.id];

    if (!real) {
      return message.reply("Pehle `chintu game start` likho 🎮");
    }

    if (guess === real) {
      delete guessGame[message.author.id];
      return message.reply("🎉 Sahi jawab! Tu jeet gaya 🔥");
    } else if (guess > real) {
      return message.reply("📉 Thoda chhota number try karo");
    } else {
      return message.reply("📈 Thoda bada number try karo");
    }
  }

  // 🎲 Dice
  if (content.includes("chintu dice")) {
    const dice = Math.floor(Math.random() * 6) + 1;
    return message.reply(`🎲 Dice roll: **${dice}**`);
  }

  // 🪙 Coin
  if (content.includes("chintu coin")) {
    const coin = Math.random() < 0.5 ? "Heads" : "Tails";
    return message.reply(`🪙 Coin flip: **${coin}**`);
  }

  // ================= MODERATION COMMANDS =================
  if (isPapa || isMod) {
    // Clear messages
    if (content.startsWith("chintu clear")) {
      const amount = parseInt(content.split("clear")[1]);
      if (!amount || amount < 1)
        return message.reply("Kitne message delete karne hain?");
      await message.channel.bulkDelete(amount, true);
      return message.reply(`🧹 ${amount} messages delete kar diye.`);
    }

    // Kick
    if (content.startsWith("chintu kick")) {
      const user = message.mentions.members.first();
      if (!user) return message.reply("Kisko kick karna hai mention karo.");
      await user.kick();
      return message.reply(`👢 ${user.user.tag} ko kick kar diya.`);
    }

    // Ban
    if (content.startsWith("chintu ban")) {
      const user = message.mentions.members.first();
      if (!user) return message.reply("Kisko ban karna hai mention karo.");
      await user.ban();
      return message.reply(`⛔ ${user.user.tag} ko ban kar diya.`);
    }

    // Announcement
    if (content.startsWith("chintu announce")) {
      const msg = message.content.split("announce")[1];
      if (!msg) return message.reply("Announcement ka text do.");
      return message.channel.send(`📢 **ANNOUNCEMENT:**\n${msg}`);
    }
  }

  // ================= AI FALLBACK =================
  const userMsg = message.content
    .toLowerCase()
    .replace("chintu", "")
    .trim();

  if (!userMsg) {
    return message.reply("Haan bhai 😄 Chintu sun raha hai, bolo kya puchna hai?");
  }

  if (isPapa) {
    const reply = await askGroqAsPapa(userMsg);
    return message.reply(reply);
  } else {
    const reply = await askGroq(userMsg);
    if (!reply)
      return message.reply("Chintu thoda busy hai bhai 😅");
    return message.reply(reply);
  }
});

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);
