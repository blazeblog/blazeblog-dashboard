import { Controller, Post } from "@nestjs/common"
import type { AuthService } from "./auth.service"
import type { Request } from "express"

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("webhook")
  async handleClerkWebhook(body: any, req: Request) {
    // Handle Clerk webhook events (user.created, user.updated, etc.)
    const { type, data } = body

    switch (type) {
      case "user.created":
        await this.authService.createUserFromClerk(data)
        break
      case "user.updated":
        await this.authService.updateUserFromClerk(data)
        break
      case "user.deleted":
        await this.authService.deleteUserFromClerk(data.id)
        break
    }

    return { received: true }
  }
}
