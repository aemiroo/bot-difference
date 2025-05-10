require('dotenv').config();
const timeZone = "Asia/Manila";
const outpostHours = [6, 10, 14, 18, 22, 2];
const outpostDuration = 20;

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
    ],
});

// Channel IDs
const DAILY_MISSION_CHANNEL = "1370112433892622476";
const PURPLE_ZONE_CHANNEL = "1370112669025308792";
const OUTPOST_ATTACK_CHANNEL = "1370103145979576411";

// Track last message IDs to prevent duplicates
let lastOutpostMessageId = null;
let lastOutpostMessageTime = 0;

function logTime() {
    return moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
}

let outpostAttack, purpleZoneResetJob, dailyMissionResetJob;
const countdownDataPath = path.join(__dirname, 'daily_mission.json');
let lastPurpleZoneMessage = null;

function saveCountdownMessageInfo(data) {
    fs.writeFileSync(countdownDataPath, JSON.stringify(data, null, 2));
}

function loadCountdownMessageInfo() {
    if (fs.existsSync(countdownDataPath)) {
        return JSON.parse(fs.readFileSync(countdownDataPath, 'utf8'));
    }
    return null;
}

function isOutpostAttackTime() {
    const now = moment().tz(timeZone);
    const currentHour = now.hour();
    const currentMinute = now.minute();
    return outpostHours.includes(currentHour) && currentMinute < outpostDuration;
}

function getNextOutpostAttackTime() {
    const now = moment().tz(timeZone);
    const currentHour = now.hour();
    
    // Check if we're currently in an outpost attack
    if (outpostHours.includes(currentHour) && now.minute() < outpostDuration) {
        return now.clone(); // We're in an outpost attack right now
    }

    let nextOutpostHour = null;
    for (const hour of [...outpostHours].sort((a, b) => a - b)) {
        if (hour > currentHour) {
            nextOutpostHour = hour;
            break;
        }
    }

    if (nextOutpostHour === null) {
        nextOutpostHour = [...outpostHours].sort((a, b) => a - b)[0];
        return now.clone().add(1, 'day').hour(nextOutpostHour).minute(0).second(0).millisecond(0);
    }

    return now.clone().hour(nextOutpostHour).minute(0).second(0).millisecond(0);
}

const sendOrUpdateDailyMissionCountdown = async () => {
    const channel = client.channels.cache.get(DAILY_MISSION_CHANNEL);
    if (!channel) return;

    const now = moment().tz(timeZone);
    const nextReset = now.clone().hour(17).minute(0).second(0).millisecond(0);
    if (now.isAfter(nextReset)) nextReset.add(1, 'day');

    const epoch = Math.floor(nextReset.valueOf() / 1000);

    const embed = {
        title: "Dead Frontier 2 - Daily Mission Reset",
        color: 5585115,
        description: "> Missions in Dead Frontier 2 reset daily, so please submit your missions before logging out.",
        fields: [{
            name: "Reset Countdown:",
            value: `<t:${epoch}:R>`
        }],
        thumbnail: {
            url: "https://images.steamusercontent.com/ugc/1467563748697286520/6DA4BD9FEDE7FF3E1DAC45F21884BCFB597A81C0/"
        },
        image: {
            url: "https://c.tenor.com/mc9-3cypZEYAAAAd/tenor.gif"
        },
        footer: {
            text: "Dead Frontier II | Wiki",
            icon_url: "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
        },
        url: "https://deadfrontier2.fandom.com/wiki/Daily_Mission"
    };

    const stored = loadCountdownMessageInfo();

    try {
        if (stored?.messageId) {
            try {
                const msg = await channel.messages.fetch(stored.messageId);
                await msg.edit({ embeds: [embed] });
                return;
            } catch (err) {
                console.warn("Couldn't edit previous countdown message, sending new one.");
            }
        }

        const newMsg = await channel.send({ embeds: [embed] });
        saveCountdownMessageInfo({ messageId: newMsg.id });
    } catch (err) {
        console.error("Failed to send/update daily mission countdown message:", err);
    }
};

// Helper function to avoid duplicate outpost messages
async function sendOutpostAttackMessage(channel, nextOutpostTime) {
    const now = Date.now();
    
    // Prevent duplicate messages within 5 minutes
    if (lastOutpostMessageTime > 0 && now - lastOutpostMessageTime < 5 * 60 * 1000) {
        console.log(`[${logTime()}] Skipping duplicate outpost attack message (sent within last 5 minutes)`);
        return;
    }

    const epoch = Math.floor(nextOutpostTime.valueOf() / 1000);
    const isCurrent = nextOutpostTime.diff(moment().tz(timeZone), 'minutes') <= 0;
    
    try {
        const message = await channel.send({
            embeds: [{
                title: "Dead Frontier 2 - Outpost Attack",
                description: isCurrent 
                    ? "An outpost attack is happening now." 
                    : "An outpost attack is about to happen.",
                url: "https://deadfrontier2.fandom.com/wiki/Outpost_Attack",
                color: 16721446,
                fields: [{
                    name: "Outpost Attack Time:",
                    value: `<t:${epoch}:F> (<t:${epoch}:R>)`
                }],
                footer: {
                    text: "Dead Frontier II | Wiki",
                    icon_url: "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                }
            }]
        });
        
        lastOutpostMessageId = message.id;
        lastOutpostMessageTime = now;
    } catch (error) {
        console.error("Failed to send Outpost Attack message:", error);
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.username}`);
    client.user.setPresence({
        status: 'dnd',
        activities: [{
            name: 'Dead Frontier 2',
            type: ActivityType.Playing
        }]
    });

    await sendOrUpdateDailyMissionCountdown();

    // Purple Zone reset job
    purpleZoneResetJob = schedule.scheduleJob("5 */20 * * * *", async () => {
        const channel = client.channels.cache.get(PURPLE_ZONE_CHANNEL);
        if (!channel) return;

        const now = moment().tz(timeZone);

        if (isOutpostAttackTime()) {
            console.log(`[${logTime()}] Skipping Purple Zone reset — current hour (${now.hour()}) is during an outpost attack.`);
            return;
        }

        const nextOutpostAttack = getNextOutpostAttackTime();
        const minutesToNextOutpost = nextOutpostAttack.diff(now, 'minutes');

        if (minutesToNextOutpost <= 20 && minutesToNextOutpost > 0) {
            const outpostChannel = client.channels.cache.get(OUTPOST_ATTACK_CHANNEL);
            if (outpostChannel) {
                await sendOutpostAttackMessage(outpostChannel, nextOutpostAttack);
            }
            return;
        }

        const nextReset = now.clone().add(20, 'minutes');
        const epoch = Math.floor(nextReset.valueOf() / 1000);

        try {
            if (lastPurpleZoneMessage) {
                await lastPurpleZoneMessage.delete().catch(err =>
                    console.warn("Failed to delete last Purple Zone message:", err.message)
                );
            }

            lastPurpleZoneMessage = await channel.send({
                embeds: [{
                    title: "Dead Frontier 2 - Challenge [Purple Zone]",
                    description: "The purple zone reset has occurred.",
                    url: "https://deadfrontier2.fandom.com/wiki/Challenge",
                    color: 16721446,
                    fields: [{
                        name: "Next Reset:",
                        value: `<t:${epoch}:F> (<t:${epoch}:R>)`
                    }],
                    footer: {
                        text: "Dead Frontier II | Wiki",
                        icon_url: "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                    }
                }]
            });
        } catch (error) {
            console.error("Failed to send Purple Zone reset message:", error);
        }
    });

    // Schedule outpost announcements at 5 minutes before each outpost attack hour
    const outpostAnnouncementJob = schedule.scheduleJob("55 * * * *", async () => {
        const now = moment().tz(timeZone);
        const currentHour = now.hour();
        const nextHour = (currentHour + 1) % 24;

        if (outpostHours.includes(nextHour)) {
            const outpostChannel = client.channels.cache.get(OUTPOST_ATTACK_CHANNEL);
            if (!outpostChannel) return;

            console.log(`[${logTime()}] Sending outpost attack announcement for ${nextHour}:00`);

            const nextOutpostTime = now.clone().add(1, 'hour').minute(0).second(0).millisecond(0);
            await sendOutpostAttackMessage(outpostChannel, nextOutpostTime);
        }
    });

    dailyMissionResetJob = schedule.scheduleJob("* * * * *", async () => {
        const now = moment().tz(timeZone);
        if (now.hour() === 17 && now.minute() === 0) {
            const channel = client.channels.cache.get(DAILY_MISSION_CHANNEL);
            if (!channel) return;

            try {
                const resetMsg = await channel.send({
                    embeds: [{
                        title: "Dead Frontier 2 - Daily Mission Reset",
                        description: "The daily mission reset has occurred.",
                        url: "https://deadfrontier2.fandom.com/wiki/Daily_Mission",
                        color: 16721446,
                        footer: {
                            text: "Dead Frontier II | Wiki",
                            icon_url: "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                });

                setTimeout(async () => {
                    try {
                        await resetMsg.delete();
                    } catch (err) {
                        console.warn("Failed to delete reset occurred message:", err.message);
                    }
                }, 5 * 60 * 1000);
            } catch (err) {
                console.error("Failed to send daily reset occurred message:", err);
            }

            setTimeout(sendOrUpdateDailyMissionCountdown, 60 * 1000);
        }
    });
});

process.on("SIGINT", () => {
    console.log("Shutting down gracefully...");
    outpostAttack?.cancel();
    purpleZoneResetJob?.cancel();
    dailyMissionResetJob?.cancel();
});

client.login(process.env.TOKEN);
