import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'spn_token';
const USER_KEY = 'spn_user';

export const storage = {
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },

  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch {}
  },

  getUser: async (): Promise<any> => {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser: async (user: object): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  },

  removeUser: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch {}
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch {}
  },
};
