import { Client, Account, Databases } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('kennykentolamult'); // Ensure this matches the Appwrite project ID

export const account = new Account(client);
export const databases = new Databases(client);
export { client };
