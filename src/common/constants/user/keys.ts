import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export const userMenu: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('📩 Murojaat yuborish', 'sendAppealForUser')],
    [Markup.button.callback('📄 Mening murojaatlarim', 'myAppeals')],
    [Markup.button.callback('📞 Bog‘lanish', 'connectWithAdmins')],
  ],
};

export const appealMenu: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('🏢 Bo‘limni tanlash', 'selectDepartmentFrUser')],
    [Markup.button.callback('➕ Sarlavha', 'titleUsersAppeal')],
    [Markup.button.callback('📝 Murojaat matni', 'textUsersAppeal')],
    [Markup.button.callback('📎 Fayl qo‘shish', 'addFileForUser')],
    [Markup.button.callback('📤 Yuborish', 'sendAppealForUser')],
    [Markup.button.callback('◀️ Ortga', 'backtoUsersMenu')],
  ],
};
