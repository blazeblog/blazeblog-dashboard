import { Injectable } from "@nestjs/common"
import type { UsersService } from "../users/users.service"

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async createUserFromClerk(clerkUser: any) {
    const userData = {
      clerkId: clerkUser.id,
      email: clerkUser.email_addresses[0]?.email_address,
      name: `${clerkUser.first_name} ${clerkUser.last_name}`.trim(),
      avatar: clerkUser.image_url,
      role: "user", // Default role
    }

    return this.usersService.create(userData)
  }

  async updateUserFromClerk(clerkUser: any) {
    const userData = {
      email: clerkUser.email_addresses[0]?.email_address,
      name: `${clerkUser.first_name} ${clerkUser.last_name}`.trim(),
      avatar: clerkUser.image_url,
    }

    return this.usersService.updateByClerkId(clerkUser.id, userData)
  }

  async deleteUserFromClerk(clerkId: string) {
    return this.usersService.deleteByClerkId(clerkId)
  }
}
