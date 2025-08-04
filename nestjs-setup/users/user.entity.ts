import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  clerkId: string

  @Column()
  email: string

  @Column()
  name: string

  @Column({ nullable: true })
  avatar: string

  @Column({ default: "user" })
  role: string

  @Column({ default: "active" })
  status: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
