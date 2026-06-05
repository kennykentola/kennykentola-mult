import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('kennykentolamult');

export const account = new Account(client);
export { client };
