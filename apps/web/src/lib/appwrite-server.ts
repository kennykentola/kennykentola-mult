import { Client, Databases, Users } from 'node-appwrite';

const createAdminClient = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'kennykentolamult')
    .setKey(process.env.APPWRITE_API_KEY || ''); // Must be set in .env.local

  return {
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    }
  };
};

export const adminAppwrite = createAdminClient();
