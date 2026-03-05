import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { LikePostDto } from './dto/like-post.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { RemoveCommentDto } from './dto/remove-comment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
@ApiTags('posts')
@Controller('posts')
// @UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const dest = join(process.cwd(), 'uploads', 'posts');
          await import('fs').then(fs => fs.promises.mkdir(dest, { recursive: true }));
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, name + extname(file.originalname));
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        description: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      createPostDto.image = `/uploads/posts/${file.filename}`;
    }
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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const dest = join(process.cwd(), 'uploads', 'posts');
          await import('fs').then(fs => fs.promises.mkdir(dest, { recursive: true }));
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, name + extname(file.originalname));
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      updatePostDto.image = `/uploads/posts/${file.filename}`;
    }
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
