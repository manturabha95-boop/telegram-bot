const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const gtts = require('gtts');
const ffmpeg = require('fluent-ffmpeg');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply('Welcome to Tiny Tales TV Bot! 🎬\nSend me a story, and I will generate your video and voiceover.');
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return;

    ctx.reply('🔄 Processing your story and generating video for Tiny Tales TV...');

    try {
        const audioPath = path.join(__dirname, 'output.mp3');
        const videoPath = path.join(__dirname, 'output.mp4');
        const speech = new gtts(text, 'en');

        // Step 1: Generate Audio using gTTS
        speech.save(audioPath, async function (err) {
            if (err) {
                return ctx.reply('❌ Error generating voiceover.');
            }

            // Step 2: Generate Video using ffmpeg (Combining Audio + Background)
            ffmpeg()
                .input('color=c=lightblue:s=1280x720:r=30')
                .inputFormat('lavfi')
                .input(audioPath)
                .outputOptions([
                    '-c:v libx264',
                    '-preset ultrafast',
                    '-c:a aac',
                    '-b:a 192k',
                    '-shortest'
                ])
                .save(videoPath)
                .on('end', async () => {
                    // Send the generated video back to Telegram
                    await ctx.replyWithVideo({ source: videoPath });

                    // Clean up files after sending
                    setTimeout(() => {
                        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
                        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
                    }, 5000);
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    ctx.reply('❌ Error generating video.');
                });
        });

    } catch (error) {
        console.error(error);
        ctx.reply('❌ An error occurred while processing your request.');
    }
});

bot.launch();
console.log('Tiny Tales Video Bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
