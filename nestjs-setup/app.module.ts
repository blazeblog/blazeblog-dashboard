import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "./auth/auth.module"
import { PostsModule } from "./posts/posts.module"
import { UsersModule } from "./users/users.module"
import { CategoriesModule } from "./categories/categories.module"
import { FormsModule } from "./forms/forms.module"
import { AnalyticsModule } from "./analytics/analytics.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "admin_panel",
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== "production",
    }),
    AuthModule,
    PostsModule,
    UsersModule,
    CategoriesModule,
    FormsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
