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

export const manageUsersKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      Markup.button.callback(
        '🙋🏻‍♂️ Ro‘yxatdan o‘tish so‘rovlari',
        'registrationRequests',
      ),
    ],
    [Markup.button.callback('📝 Foydalanuvchilar', 'viewUsers')],
    [Markup.button.callback('◀️ Ortga', 'backToAdminMenu')],
  ],
};

export const backToManageUsers: InlineKeyboardMarkup = {
  inline_keyboard: [[Markup.button.callback('◀️ Ortga', 'backToManageUsers')]],
};

export const newsKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('Yangilik yuborish', 'sendNews')],
    [Markup.button.callback('Yangiliklar holati', 'newsStatus')],
    [Markup.button.callback('◀️ Ortga', 'backToAdminMenu')],
  ],
};

export const manageDepartmentKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('➕ Yangi bo‘lim qo‘shish', 'addNewDepartment')],
    [Markup.button.callback('✏️ Bo‘limni tahrirlash', 'editDepartment')],
    [Markup.button.callback('❌ Bo‘limni o‘chirish', 'deleteDepartment')],
    [Markup.button.callback('📋 Bo‘limlar ro‘yxati', 'departmentList')],
    [Markup.button.callback('🔄 Lavozimlarni boshqarish', 'managePosition')],
    [Markup.button.callback('◀️ Ortga', 'backToAdminMenu')],
  ],
};

export const sendNewsKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('👥 Barcha foydalanuvchilarga', 'forEverUsers')],
    [Markup.button.callback('🏢 Bo‘limlar bo‘yicha', 'byDepatments')],
    [Markup.button.callback('👤 Lavozimlar bo‘yicha', 'byPositions')],
    [
      Markup.button.callback(
        '🗂 Tanlangan foydalanuvchilarga',
        'forSelectedUsers',
      ),
    ],
    [Markup.button.callback('◀️ Ortga', 'backToNews')],
  ],
};

export const newsStatusKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('🔍 O‘qiganlarni ko‘rish', 'viewRead')],
    [Markup.button.callback('◀️ Ortga', 'backToNews')],
  ],
};
