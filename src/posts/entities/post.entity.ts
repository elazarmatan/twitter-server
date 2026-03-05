export interface Comment {
  username: string;
  description: string;
}

export class Post {
  id: number;
  username: string;
  description: string;
  likes: string[];
  comments: Comment[];
  image?: string;
  tags?: string[];
}
