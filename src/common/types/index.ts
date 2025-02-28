import { Context } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

export type ContextType = Context &
  SceneContext & {
    session: {
      lastMessage: any;
      currentDepartment: string;
      userDepartment: string;
      lastSelectedDepartment: string;
      selectedUser: string;
      adminPage: number;
      searchDepartment: string;
      usersNewPhone: string;
    };
  };
