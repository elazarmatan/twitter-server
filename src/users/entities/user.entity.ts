export class User {
  id: number;
  name: string;
  username: string;
  phone: string;
  email: string;
  password: string;
  birthDate?: string;
  bio?: string;
  image?: string;
  followers?: string[]; // array of usernames
  following?: string[]; // array of usernames
}
