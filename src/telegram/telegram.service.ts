import { Injectable } from '@nestjs/common';
import {
  Start,
  Update,
  Action,
  Command,
} from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';
//import { TelegramActions } from './telegram.actions';
//import { BOT_MESSAGES } from './telegram.message';
const COMMANDS = [
  {
    command: '/start',
    description: 'Inicio',
  },
  {
    command: '/id',
    description: 'Obtener ID',
  },
];

@Update()
@Injectable()
export class TelegramService {
  constructor(@InjectBot() private bot: Telegraf<Context>) {
    this.bot.telegram.setMyCommands(COMMANDS);
  }

  getData(): { message: string } {
    return { message: 'Welcome to server!' };
  }

  @Start()
  async startCommand(ctx): Promise<any> {
    const userTelegramName: string =
      ctx?.update?.message?.from?.first_name ||
      ctx?.update?.message?.from?.username;

    await ctx.reply(`${userTelegramName} como estas?`);

    const chatID: number = ctx?.update?.message?.from?.id;

    //if (!chatID) {
    //  await ctx.reply(`${BOT_MESSAGES.ERROR.GENERAL}`);
    //}

    const user: null = null;

    // Handlers for new user
    //if (!user) {
    //  await ctx.reply(BOT_MESSAGES.NEW_USER_PERMISSIONS);
    //}
    // Handlers for exist user
    //else {
    //  console.log('user', user);
    //}
  }

  @Command('id')
  async myProfileCommand(ctx): Promise<any> {
    console.log('myProfileCommand', ctx);
    const chatID: number = ctx?.update?.message?.from?.id;
    //
    if (!chatID) {
      await ctx.reply(`Ups! Parece que no tienes un ID, o ocurrio un problema`);
    }
    //
    //const user: null  = null
    //
    //// Message for new user
    //if (!user) {
    //  try {
    //    await ctx.reply(`${BOT_MESSAGES.NEW_USER_MY_PROFILE}`);
    //  } catch (error) {
    //    console.log('sendMessage :::', error.message);
    //  }
    //}
    //// Exist user
    //else {
    //  await this.telegramUtils.handleMyProfileCommand({ ctx, user });
    //}
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
    buttons: { text: string; callback_data: string }[],
  ): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(
        chatId,
        message,
        Markup.inlineKeyboard(buttons),
      );
    } catch (error) {
      console.error('Error al enviar mensaje con botones:', error);
      throw error;
    }
  }

  // Handle btns click
  @Action(/.*/)
  async handler(ctx): Promise<any> {
    try {
      const actionData = ctx.callbackQuery.data;

      try {
        const callbackParams = JSON.parse(actionData);

        if (callbackParams.service === 'LAB') {
          console.log('Parámetros del callback:', {
            id: callbackParams.id,
            received: callbackParams.received,
            canceled: callbackParams.canceled,
            service: callbackParams.service,
          });
        } else if (callbackParams.service === 'FAR') {
          console.log('Parámetros del callback:', {
            id: callbackParams.id,
            received: callbackParams.received,
            canceled: callbackParams.canceled,
            service: callbackParams.service,
          });
        } else if (callbackParams.service === 'NUR') {
          console.log('Parámetros del callback:', {
            id: callbackParams.id,
            received: callbackParams.received,
            canceled: callbackParams.canceled,
            service: callbackParams.service,
          });
        }
      } catch (parseError) {
        console.log('El callback_data no es un JSON válido:', actionData);
      }

      //console.log('Usuario:', from);
      //console.log('Datos completos del contexto:', ctx);
    } catch (error) {
      console.log('[error]', error);
    }
  }
}
