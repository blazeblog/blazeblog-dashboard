import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS for your frontend
  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  })

  // Global validation pipe
  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
  app.useGlobalPipes(validationPipe)

  // Clerk middleware for protected routes
  app.use("/api/admin/*", ClerkExpressRequireAuth())

  await app.listen(3001)
  console.log("NestJS server running on http://localhost:3001")
}
bootstrap()
