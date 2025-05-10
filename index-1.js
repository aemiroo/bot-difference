const schedule = require('node-schedule');
const moment = require('moment-timezone');

const DAILY_MISSION_CHANNEL = "1370112433892622476";
const PURPLE_ZONE_CHANNEL = "1370112669025308792";
const OUTPOST_ATTACK_CHANNEL = "1370103145979576411";

let isOutpost = false;
const outpostAttackRule = new schedule.RecurrenceRule()
outpostAttackRule.tz = "Asia/Manila"
outpostAttackRule.hour = [6, 10, 14, 18, 22, 2];
outpostAttackRule.minute = 0;
outpostAttackRule.second = 0;

let outpostAttackMessage;
let purpleZoneResetMessage;
let dailyMissionResetMessage;

/**
 * 
 * @param {import("discord.js").Client} client 
 */
module.exports = (client) => {

    const outpostAttack = schedule.scheduleJob(outpostAttackRule, () => {
        const channel = client.channels.cache.get(OUTPOST_ATTACK_CHANNEL);

        if (channel) {
            isOutpost = !isOutpost;
            if (!outpostAttackMessage) {
                outpostAttackMessage = channel.send({
                    "content": null,
                    "embeds": [{
                        "title": "Dead Frontier 2 - Outpost Attack",
                        "description": `The outpost attack has occurred.\nThe current outpost attack will end <t:${Math.round((Date.now() + 20 * 60 * 1000) / 1000)}:R>.`,
                        "url": "https://deadfrontier2.fandom.com/wiki/Outpost_Attack",
                        "color": 16721446,
                        "footer": {
                            "text": "Dead Frontier II | Wiki",
                            "icon_url": "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                });
            } else {
                outpostAttackMessage.edit({
                    "content": null,
                    "embeds": [{
                        "title": "Dead Frontier 2 - Outpost Attack",
                        "description": `The outpost attack has occurred.\nThe current outpost attack will end <t:${Math.round((Date.now() + 20 * 60 * 1000) / 1000)}:R>.`,
                        "url": "https://deadfrontier2.fandom.com/wiki/Outpost_Attack",
                        "color": 16721446,
                        "footer": {
                            "text": "Dead Frontier II | Wiki",
                            "icon_url": "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                });
            } 

            schedule.scheduleJob(new Date(Date.now() + 20 * 60 * 1000), () => {
                isOutpost = !isOutpost;
                outpostAttackMessage.edit({
                    "content": null,
                    "embeds": [{
                        "title": "Dead Frontier 2 - Outpost Attack",
                        "description": `The outpost attack has ended <t:${Math.round(Date.now() / 1000)}:R>.\nThe next outpost attack will occur <t:${Math.round((Date.now() + 108e5 + 24e5) / 1000)}:R>.`,
                        "url": "https://deadfrontier2.fandom.com/wiki/Outpost_Attack",
                        "color": 16721446,
                        "footer": {
                            "text": "Dead Frontier II | Wiki",
                            "icon_url": "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                }).catch(() => null);
            });
        }
    });

    const dailyMissionResetJob = schedule.scheduleJob("0 0 17 * * *", () => {
        const channel = client.channels.cache.get(DAILY_MISSION_CHANNEL);

        if (channel) {
            if (!dailyMissionResetMessage) {
                dailyMissionResetMessage = channel.send({
                    "content": null,
                    "embeds": [{
                        "title": "Dead Frontier 2 - Daily Reset",
                        "description": [
                            `> Missions in Dead Frontier 2 reset daily, so please submit your missions before logging out.`,
                            `The daily reset will occur <t:${Math.round((Date.now() + 864e5) / 1000)}:R>.`
                        ].join("\n"),
                        "url": "https://deadfrontier2.fandom.com/wiki/Daily_Mission",
                        "color": 16721446,
                        "footer": {
                            "text": "Dead Frontier II | Wiki",
                            "icon_url": "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                });
            } else {
                dailyMissionResetMessage.edit({
                    "content": null,
                    "embeds": [{
                        "title": "Dead Frontier 2 - Daily Reset",
                        "description": [
                            `> Missions in Dead Frontier 2 reset daily, so please submit your missions before logging out.`,
                            `The daily reset will occur <t:${Math.round((Date.now() + 864e5) / 1000)}:R>.`
                        ].join("\n"),
                        "url": "https://deadfrontier2.fandom.com/wiki/Daily_Mission",
                        "color": 16721446,
                        "footer": {
                            "text": "Dead Frontier II | Wiki",
                            "icon_url": "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                });
            }
        }
    });

    const purpleZoneResetJob = schedule.scheduleJob("5 */20 * * * *", () => {
        if (!isOutpost) {
            const channel = client.channels.cache.get(PURPLE_ZONE_CHANNEL);

            if (channel) {
                purpleZoneResetMessage = channel.send({
                    "content": null,
                    "embeds": [{
                        "title": "Dead Frontier 2 - Challenge [Purple Zone]",
                        "description": `The purple zone reset has occurred.\nThe next reset will occur <t:${Math.round(Date.now() + (2 * 60 * 1000) / 1000)}:R>`,
                        "url": "https://deadfrontier2.fandom.com/wiki/Challenge",
                        "color": 16721446,
                        "footer": {
                            "text": "Dead Frontier II | Wiki",
                            "icon_url": "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                })
            } else {
                purpleZoneResetMessage.edit({
                    "content": null,
                    "embeds": [{
                        "title": "Dead Frontier 2 - Challenge [Purple Zone]",
                        "description": `The purple zone reset has occurred.\nThe next reset will occur <t:${Math.round(Date.now() + (2 * 60 * 1000) / 1000)}:R>`,
                        "url": "https://deadfrontier2.fandom.com/wiki/Challenge",
                        "color": 16721446,
                        "footer": {
                            "text": "Dead Frontier II | Wiki",
                            "icon_url": "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                })
            }
        }
    });

    client.once("ready", () => {
        const purpleZoneChannel = client.channels.cache.get(PURPLE_ZONE_CHANNEL);
        const dailyMissionChannel = client.channels.cache.get(DAILY_MISSION_CHANNEL);
        const outpostAttackChannel = client.channels.cache.get(OUTPOST_ATTACK_CHANNEL);

        const purpleZoneResetEpoch = () => {
            const now = moment.tz('Asia/Manila');

            // Round to the next :00, :20, or :40
            const currentMinute = now.minute();
            let nextMinute;

            if (currentMinute < 20) {
                nextMinute = 20;
            } else if (currentMinute < 40) {
                nextMinute = 40;
            } else {
                nextMinute = 0;
                now.add(1, 'hour');
            }

            // Set the time to the next interval
            now.minute(nextMinute).second(0).millisecond(0);

            return now.valueOf(); // returns epoch time in ms
        }

        const outpostAttackEpoch = () => {
            const validHours = [2, 6, 10, 14, 18, 22];
            const now = moment.tz('Asia/Manila');
            const currentHour = now.hour();

            // Find the next valid hour
            let targetHour = validHours.find(h => h > currentHour);

            // If no future valid hour today, take the first one tomorrow
            if (targetHour === undefined) {
                targetHour = validHours[0];
                now.add(1, 'day');
            }

            // Set to the target hour
            now.hour(targetHour).minute(0).second(0).millisecond(0);

            return now.valueOf();
        }

        const dailyMissionEpoch = () => {
            const now = moment.tz('Asia/Manila');
            const target = now.clone().hour(17).minute(0).second(0).millisecond(0);

            if (now.isAfter(target)) {
                // It's past 17:00 today — use tomorrow's 17:00
                target.add(1, 'day');
            }

            return target.valueOf(); // epoch in ms
        }

        if (purpleZoneChannel && dailyMissionChannel && outpostAttackChannel) {
            purpleZoneResetMessage = purpleZoneChannel.send({
                    "content": null,
                    "embeds": [{
                        "title": "Dead Frontier 2 - Challenge [Purple Zone]",
                        "description": `The purple zone reset has occurred.\nThe next reset will occur <t:${Math.round(purpleZoneResetEpoch() / 1000)}:R>`,
                        "url": "https://deadfrontier2.fandom.com/wiki/Challenge",
                        "color": 16721446,
                        "footer": {
                            "text": "Dead Frontier II | Wiki",
                            "icon_url": "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                });
            outpostAttackMessage = outpostAttackChannel.send({
                    "content": null,
                    "embeds": [{
                        "title": "Dead Frontier 2 - Outpost Attack",
                        "description": `The next outpost attack will occur <t:${Math.round(outpostAttackEpoch() / 1000)}:R>.`,
                        "url": "https://deadfrontier2.fandom.com/wiki/Outpost_Attack",
                        "color": 16721446,
                        "footer": {
                            "text": "Dead Frontier II | Wiki",
                            "icon_url": "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                });
            dailyMissionResetMessage = dailyMissionChannel.send({
                    "content": null,
                    "embeds": [{
                        "title": "Dead Frontier 2 - Daily Reset",
                        "description": [
                            `> Missions in Dead Frontier 2 reset daily, so please submit your missions before logging out.`,
                            `The daily reset will occur <t:${Math.round(dailyMissionEpoch() / 1000)}:R>.`
                        ].join("\n"),
                        "url": "https://deadfrontier2.fandom.com/wiki/Daily_Mission",
                        "color": 16721446,
                        "footer": {
                            "text": "Dead Frontier II | Wiki",
                            "icon_url": "https://static.wikia.nocookie.net/deadfrontier2/images/4/4a/Site-favicon.ico/revision/latest?cb=20231105161852"
                        }
                    }]
                })
        }
    });

    process.once("SIGINT", () => {
        console.log("Shutting down tasks gracefully...");
        outpostAttack?.cancel();
        purpleZoneResetJob?.cancel();
        dailyMissionResetJob?.cancel();
    });
}
