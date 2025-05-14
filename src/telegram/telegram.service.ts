import { Injectable } from '@nestjs/common';
import { Hears, Help, On, Start, Update, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';

@Update()
@Injectable()
export class TelegramService {
  constructor(@InjectBot() private bot: Telegraf<Context>) {}

  getData(): { message: string } {
    return { message: 'Welcome to server!' };
  }

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply('Welcome');
  }

  @Help()
  async helpCommand(ctx: Context) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async onSticker(ctx: Context) {
    await ctx.reply('👍');
  }

  @Hears('hi')
  async hearsHi(ctx: Context) {
    await ctx.reply('Hey there');
  }

  async sendMessage(chatId: number, message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, message);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  async sendMessageWithButtons(
    chatId: number, 
    message: string, 
    buttons: { text: string; callback_data: string }[]
  ): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(
        chatId,
        message,
        Markup.inlineKeyboard(buttons)
      );
    } catch (error) {
      console.error('Error al enviar mensaje con botones:', error);
      throw error;
    }
  }

  @Action(/option\d+/)
  async handleButtonClick(ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      const callbackData = ctx.callbackQuery.data;
      await ctx.answerCbQuery();
      await ctx.reply(`Has seleccionado: ${callbackData}`);
    }
  }
}