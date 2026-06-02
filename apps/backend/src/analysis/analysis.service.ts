import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { AiClientService } from "../ai-client/ai-client.service";
import { CreateAnalysisDto } from "./dto/create-analysis.dto";
import { AnalysisResponseDto } from "./dto/analysis-result.dto";
import { Analysis } from "./entities/analysis.entity";

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly aiClient: AiClientService,
    @InjectRepository(Analysis)
    private readonly analysisRepo: Repository<Analysis>
  ) {}

  async analyze(
    file: Express.Multer.File,
    metadata: CreateAnalysisDto,
    userId?: string
  ): Promise<AnalysisResponseDto> {
    const imageHash = createHash("sha256").update(file.buffer).digest("hex");
    const analysisId = uuidv4();

    this.logger.log(`Análisis iniciado — id: ${analysisId} | file: ${file.originalname}`);

    const result = await this.aiClient.predict({
      image_b64: file.buffer.toString("base64"),
      image_format: file.mimetype.split("/")[1],
      metadata: {
        patient_id: metadata.patientId,
        study_type: metadata.studyType,
      },
    });

    // Persistir en SQLite
    const entity = this.analysisRepo.create({
      analysis_id: analysisId,
      patient_id: metadata.patientId,
      study_type: metadata.studyType,
      prediction: result.prediction,
      confidence: result.confidence,
      class_scores: result.class_scores,
      model_version: result.model_version,
      inference_time_ms: result.inference_time_ms,
      image_hash_sha256: imageHash,
      user_id: userId ?? null,
      heatmap_b64: result.heatmap_b64 ?? null,
    });
    await this.analysisRepo.save(entity);

    this.logger.log(
      `Análisis completado y guardado — id: ${analysisId} | prediction: ${result.prediction}`
    );

    return {
      analysis_id: analysisId,
      status: "completed",
      result,
      audit: {
        processed_at: new Date().toISOString(),
        node_version: process.version,
        image_hash_sha256: imageHash,
      },
    };
  }

  async findAll(userId: string): Promise<Analysis[]> {
    return this.analysisRepo.find({
      where: { user_id: userId },
      order: { created_at: "DESC" },
      take: 20,
    });
  }
}
