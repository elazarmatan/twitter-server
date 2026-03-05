import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags } from '@nestjs/swagger';
import { LikePostDto } from './dto/like-post.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { RemoveCommentDto } from './dto/remove-comment.dto';
@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  @Get()
  async findAll() {
    return await this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOne(+id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    const post = await this.postsService.update(+id, updatePostDto);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const success = await this.postsService.remove(+id);
    if (!success) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return { message: `Post with ID ${id} removed successfully` };
  }

  @Put(':id/like')
async likePost(
  @Param('id') id: string,
  @Body() likePostDto: LikePostDto
) {
  const post = await this.postsService.likePost(+id, likePostDto.username);

  if (!post) {
    throw new NotFoundException(`Post with ID ${id} not found`);
  }

  return post;
}

  @Delete(':id/like')
  async unlikePost(
    @Param('id') id: string,
    @Body() likePostDto: LikePostDto
  ) {
    const post = await this.postsService.unlikePost(+id, likePostDto.username);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  @Post(':id/comment')
  async addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto
  ) {
    const post = await this.postsService.addComment(+id, addCommentDto.username, addCommentDto.description);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  @Delete(':id/comment')
  async removeComment(
    @Param('id') id: string,
    @Body() removeCommentDto: RemoveCommentDto
  ) {
    const post = await this.postsService.removeComment(+id, removeCommentDto.username, removeCommentDto.description);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }
}
