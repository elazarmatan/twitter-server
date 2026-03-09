import { Injectable, ConflictException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PostsService {
  private readonly filePath = path.join(__dirname, '../../data/posts.json');
  private nextId = 1;

  private async readPosts(): Promise<Post[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const posts = JSON.parse(data);
      if (posts.length > 0) {
        this.nextId = Math.max(...posts.map(p => p.id)) + 1;
      }
      // Ensure all posts have likes array
      posts.forEach(post => {
        if (!post.likes) {
          post.likes = [];
        }
        if (!post.comments) {
          post.comments = [];
        }
        // initialize optional properties so consumers don't have to check
        if (!('tags' in post)) {
          post.tags = [];
        }
        if (!('image' in post)) {
          post.image = undefined;
        }
      });
      return posts;
    } catch (error) {
      return [];
    }
  }

  private async writePosts(posts: Post[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(posts, null, 2));
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const posts = await this.readPosts();
    const newPost: Post = {
      id: this.nextId++,
      username: createPostDto.username,
      description: createPostDto.description,
      likes: [],
      comments: [],
      tags: createPostDto.tags || [],
      image: createPostDto.image,
    };
    posts.push(newPost);
    await this.writePosts(posts);
    return newPost;
  }

  async findAll(): Promise<Post[]> {
    return (await this.readPosts()).reverse();
  }

  async findOne(id: number): Promise<Post | null> {
    const posts = await this.readPosts();
    return posts.find(post => post.id === id) || null;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post | null> {
    const posts = await this.readPosts();
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return null;
    }
    posts[postIndex] = { ...posts[postIndex], ...updatePostDto };
    await this.writePosts(posts);
    return posts[postIndex];
  }

  async remove(id: number): Promise<boolean> {
    const posts = await this.readPosts();
    const filteredPosts = posts.filter(post => post.id !== id);
    if (filteredPosts.length === posts.length) {
      return false;
    }
    await this.writePosts(filteredPosts);
    return true;
  }

  async likePost(postId: number, username: string): Promise<Post | null> {
    const posts = await this.readPosts();
    const postIndex = posts.findIndex(post => post.id === postId);
    if (postIndex === -1) {
      return null;
    }
    const post = posts[postIndex];
    if (post.likes.includes(username)) {
      throw new ConflictException(`המשתמש ${username} כבר עשה לייק לפוסט זה.`);
    }
    post.likes.push(username);
    await this.writePosts(posts);
    return post;
  }

  async unlikePost(postId: number, username: string): Promise<Post | null> {
    const posts = await this.readPosts();
    const postIndex = posts.findIndex(post => post.id === postId);
    if (postIndex === -1) {
      return null;
    }
    const post = posts[postIndex];
    const likeIndex = post.likes.indexOf(username);
    if (likeIndex === -1) {
      throw new ConflictException(`המשתמש ${username} לא עשה לייק לפוסט זה.`);
    }
    post.likes.splice(likeIndex, 1);
    await this.writePosts(posts);
    return post;
  }

  async addComment(postId: number, username: string, description: string): Promise<Post | null> {
    const posts = await this.readPosts();
    const postIndex = posts.findIndex(post => post.id === postId);
    if (postIndex === -1) {
      return null;
    }
    const post = posts[postIndex];
    post.comments.push({ username, description });
    await this.writePosts(posts);
    return post;
  }

  async removeComment(postId: number, username: string, description: string): Promise<Post | null> {
    const posts = await this.readPosts();
    const postIndex = posts.findIndex(post => post.id === postId);
    if (postIndex === -1) {
      return null;
    }
    const post = posts[postIndex];
    const commentIndex = post.comments.findIndex(comment => comment.username === username && comment.description === description);
    if (commentIndex === -1) {
      throw new ConflictException(`התגובה לא נמצאה.`);
    }
    post.comments.splice(commentIndex, 1);
    await this.writePosts(posts);
    return post;
  }
}
