import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UsersService {
  private readonly filePath = path.join(__dirname, '../../data/users.json');
  private nextId = 1;

  private async readUsers(): Promise<User[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const users = JSON.parse(data);
      if (users.length > 0) {
        this.nextId = Math.max(...users.map(u => u.id)) + 1;
      }
      // ensure optional fields exist
      users.forEach(user => {
        if (!('image' in user)) {
          user.image = undefined;
        }
        if (!('followers' in user)) {
          user.followers = [];
        }
        if (!('following' in user)) {
          user.following = [];
        }
      });
      return users;
    } catch (error) {
      return [];
    }
  }

  private async writeUsers(users: User[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(users, null, 2));
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const users = await this.readUsers();
    const existingUser = users.find(user => user.username === createUserDto.username);
    if (existingUser) {
      throw new ConflictException(`היוזר ${createUserDto.username} כבר קיים. אנא בחר שם אחר.`);
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser: User = {
      id: this.nextId++,
      name: createUserDto.name,
      username: createUserDto.username,
      phone: createUserDto.phone,
      email: createUserDto.email,
      password: hashedPassword,
      birthDate: createUserDto.birthDate,
      bio: createUserDto.bio,
      image: createUserDto.image,
      followers: [],
      following: [],
    };
    users.push(newUser);
    await this.writeUsers(users);
    return newUser;
  }

  async findAll(): Promise<User[]> {
    return await this.readUsers();
  }

  async findOne(id: number): Promise<User | null> {
    const users = await this.readUsers();
    return users.find(user => user.id === id) || null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const users = await this.readUsers();
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return null;
    }
    // Check if username is being updated and if it's unique
    if (updateUserDto.username && updateUserDto.username !== users[userIndex].username) {
      const existingUser = users.find(user => user.username === updateUserDto.username);
      if (existingUser) {
        throw new ConflictException(`היוזר ${updateUserDto.username} כבר קיים. אנא בחר שם אחר.`);
      }
    }
    // if password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    users[userIndex] = { ...users[userIndex], ...updateUserDto };
    await this.writeUsers(users);
    return users[userIndex];
  }

  /**
   * Validate credentials and return user if valid, otherwise null.
   */
  async validateUser(username: string, pass: string): Promise<User | null> {
    const users = await this.readUsers();
    const user = users.find(u => u.username === username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // strip password before returning
      const { password, ...result } = user as any;
      return result;
    }
    return null;
  }

  async remove(id: number): Promise<boolean> {
    const users = await this.readUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    if (filteredUsers.length === users.length) {
      return false;
    }
    await this.writeUsers(filteredUsers);
    return true;
  }

  async followUser(currentUsername: string, userToFollowUsername: string): Promise<User | null> {
    const users = await this.readUsers();
    
    const currentUserIndex = users.findIndex(u => u.username === currentUsername);
    const userToFollowIndex = users.findIndex(u => u.username === userToFollowUsername);
    
    if (currentUserIndex === -1 || userToFollowIndex === -1) {
      return null;
    }

    // Prevent following yourself
    if (currentUsername === userToFollowUsername) {
      return null;
    }

    // Add to following list
    if (!users[currentUserIndex].following) {
      users[currentUserIndex].following = [];
    }
    if (!users[currentUserIndex].following.includes(userToFollowUsername)) {
      users[currentUserIndex].following.push(userToFollowUsername);
    }

    // Add to followers list
    if (!users[userToFollowIndex].followers) {
      users[userToFollowIndex].followers = [];
    }
    if (!users[userToFollowIndex].followers.includes(currentUsername)) {
      users[userToFollowIndex].followers.push(currentUsername);
    }

    await this.writeUsers(users);
    const { password, ...result } = users[currentUserIndex] as any;
    return result;
  }

  async unfollowUser(currentUsername: string, userToUnfollowUsername: string): Promise<User | null> {
    const users = await this.readUsers();
    
    const currentUserIndex = users.findIndex(u => u.username === currentUsername);
    const userToUnfollowIndex = users.findIndex(u => u.username === userToUnfollowUsername);
    
    if (currentUserIndex === -1 || userToUnfollowIndex === -1) {
      return null;
    }

    // Remove from following list
    if (users[currentUserIndex].following) {
      users[currentUserIndex].following = users[currentUserIndex].following!.filter(u => u !== userToUnfollowUsername);
    }

    // Remove from followers list
    if (users[userToUnfollowIndex].followers) {
      users[userToUnfollowIndex].followers = users[userToUnfollowIndex].followers!.filter(u => u !== currentUsername);
    }

    await this.writeUsers(users);
    const { password, ...result } = users[currentUserIndex] as any;
    return result;
  }

  async findByUsername(username: string): Promise<User | null> {
    const users = await this.readUsers();
    const user = users.find(u => u.username === username);
    if (!user) {
      return null;
    }
    const { password, ...result } = user as any;
    return result;
  }
}
