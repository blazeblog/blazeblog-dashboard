import { Controller, Get, Post, Body, Param, Put, Delete, Req } from "@nestjs/common"
import type { PostsService } from "./posts.service"
import type { CreatePostDto, UpdatePostDto } from "./dto/post.dto"
import type { Request } from "express"

@Controller("api/admin/posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async index(@Req() request: Request) {
    const query = request.query
    const posts = await this.postsService.findAll(query)
    const categories = await this.postsService.getCategories()
    
    // Return Inertia response
    return {
      component: 'admin/posts/index',
      props: {
        posts,
        categories,
        filters: query,
        auth: { user: request.user },
      }
    }
  }

  @Get('create')
  async create(@Req() request: Request) {
    const categories = await this.postsService.getCategories()
    
    return {
      component: 'admin/posts/create',
      props: {
        categories,
        auth: { user: request.user },
      }
    }
  }

  @Post()
  async store(@Body() createPostDto: CreatePostDto, @Req() request: Request) {
    const post = await this.postsService.create({
      ...createPostDto,
      authorId: request.user.id,
    })

    return {
      redirect: "/admin/posts",
      flash: { message: "Post created successfully!" },
    }
  }

  @Get(":id/edit")
  async edit(@Param('id') id: number, @Req() request: Request) {
    const post = await this.postsService.findOne(id)
    const categories = await this.postsService.getCategories()

    return {
      component: "admin/posts/edit",
      props: {
        post,
        categories,
        auth: { user: request.user },
      },
    }
  }

  @Put(":id")
  async update(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto) {
    await this.postsService.update(id, updatePostDto)

    return {
      redirect: "/admin/posts",
      flash: { message: "Post updated successfully!" },
    }
  }

  @Delete(':id')
  async destroy(@Param('id') id: number) {
    await this.postsService.remove(id)
    
    return {
      redirect: '/admin/posts',
      flash: { message: 'Post deleted successfully!' }
    }
  }
}
