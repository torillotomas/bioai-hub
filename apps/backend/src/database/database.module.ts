import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Analysis } from "../analysis/entities/analysis.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: "analyses.db",
      entities: [Analysis],
      synchronize: true, // En producción usar migraciones
    }),
  ],
})
export class DatabaseModule {}
