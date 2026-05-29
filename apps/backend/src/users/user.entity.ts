import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({ nullable: true, type: "text" })
  refresh_token_hash!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
