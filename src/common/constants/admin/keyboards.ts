import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export const adminMenu: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('📋 Foydalanuvchilarni boshqarish', 'manageUsers')],
    [Markup.button.callback('📢 Yangiliklar', 'news')],
    [
      Markup.button.callback(
        '⚙️ Bo‘lim va lavozimlarni sozlash',
        'departmentSettings',
      ),
    ],
  ],
};

export const backToAdminMenu: InlineKeyboardMarkup = {
  inline_keyboard: [[Markup.button.callback('◀️ Ortga', 'backToAdminMenu')]],
};
