import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('kennykentolamult');

export const account = new Account(client);
export const databases = new Databases(client);

export const appwriteConfig = {
  databaseId: 'multicompany' // Using the same database ID configured elsewhere
};

export { client };
