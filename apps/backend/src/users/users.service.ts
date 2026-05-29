import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  create(data: Partial<User>) {
    return this.userRepo.save(this.userRepo.create(data));
  }

  updateRefreshToken(id: string, hash: string | null) {
    return this.userRepo.update(id, { refresh_token_hash: hash });
  }
}
