const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const gtts = require('gtts');
const ffmpeg = require('fluent-ffmpeg');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply('Welcome to Tiny Tales TV Bot! 🎬\nSend me a short story or text, and I will help generate your video script and voiceover.');
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return;

    ctx.reply('🔄 Processing your story for Tiny Tales TV...');

    try {
        // Step 1: Generate Audio using gTTS
        const audioPath = path.join(__dirname, 'output.mp3');
        const speech = new gtts(text, 'en');

        speech.save(audioPath, async function (err) {
            if (err) {
                return ctx.reply('❌ Error generating voiceover.');
            }

            // Send the generated voiceover back to Telegram
            await ctx.replyWithAudio({ source: audioPath });
            
            // Clean up file after sending
            setTimeout(() => {
                if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
            }, 5000);
        });

    } catch (error) {
        console.error(error);
        ctx.reply('❌ An error occurred while processing your request.');
    }
});

bot.launch();
console.log('Tiny Tales Video Bot is running with gTTS support...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
