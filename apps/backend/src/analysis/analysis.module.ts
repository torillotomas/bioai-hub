import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";
import { AiClientModule } from "../ai-client/ai-client.module";
import { Analysis } from "./entities/analysis.entity";

@Module({
  imports: [AiClientModule, TypeOrmModule.forFeature([Analysis])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
