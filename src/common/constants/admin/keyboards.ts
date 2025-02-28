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
    [Markup.button.callback('📋 Bo‘limlar ro‘yxati', 'departmentList')],
    [Markup.button.callback('◀️ Ortga', 'backToAdminMenu')],
  ],
};

export const departmentKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('➕ Ichki bo‘lim qo‘shish', 'addChildDEpartment')],
    [Markup.button.callback('✏️ Bo‘limni tahrirlash', 'editDepartment')],
    [Markup.button.callback('❌ Bo‘limni o‘chirish', 'deleteDepartment')],
    [Markup.button.callback('◀️ Ortga', 'back')],
  ],
};

export const backToDepartments: InlineKeyboardMarkup = {
  inline_keyboard: [[Markup.button.callback('◀️ Ortga', 'backToDepartments')]],
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

export const backToSendNews: InlineKeyboardMarkup = {
  inline_keyboard: [[Markup.button.callback('◀️ Ortga', 'backToSendNews')]],
};

export const newsStatusKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('🔍 O‘qiganlarni ko‘rish', 'viewRead')],
    [Markup.button.callback('◀️ Ortga', 'backToNews')],
  ],
};

export const childDepartments: InlineKeyboardMarkup = {
  inline_keyboard: [[Markup.button.callback(`🏢Ichki bo'limiar`, 'childs')]],
};

export const editDepartment: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('🔄 Lavozimlarni boshqarish', 'managePosition')],
    [Markup.button.callback('◀️ Ortga', 'backToDepartment')],
  ],
};

export const departmentPositions: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback(`Bo'lim boshliqlari`, 'managers')],
    [Markup.button.callback('Hodimlar', 'employes')],
    [Markup.button.callback('◀️ Ortga', 'backToManageDepartment')],
  ],
};

export const userKeysForAdmin: InlineKeyboardMarkup = {
  inline_keyboard: [
    [Markup.button.callback('✏️ Foydalanuvchini tahrirlash', 'editUser')],
    [Markup.button.callback('❌ Foydalanuvchini o‘chirish', 'deleteUser')],
    [Markup.button.callback('◀️ Ortga', 'backToUsersList')],
  ],
};

export const editUserKeys: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      Markup.button.callback(
        '📞 Telefon raqamini o‘zgartiirish',
        'editUsersPhone',
      ),
    ],
    [
      Markup.button.callback(
        '🏬 Boshqa bo‘limga o‘tkazish',
        'changeUsersDepartment',
      ),
    ],
    [
      Markup.button.callback(
        '💼 Lavozimini o‘zgartirish',
        'changeUsersPosition',
      ),
    ],
    [Markup.button.callback('◀️ Ortga', 'backToUserInformation')],
  ],
};
