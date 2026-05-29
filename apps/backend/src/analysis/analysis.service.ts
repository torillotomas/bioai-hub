import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { AiClientService } from "../ai-client/ai-client.service";
import { CreateAnalysisDto } from "./dto/create-analysis.dto";
import { AnalysisResponseDto } from "./dto/analysis-result.dto";

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(private readonly aiClient: AiClientService) {}

  async analyze(
    file: Express.Multer.File,
    metadata: CreateAnalysisDto
  ): Promise<AnalysisResponseDto> {
    const imageHash = createHash("sha256").update(file.buffer).digest("hex");
    const analysisId = uuidv4();

    this.logger.log(
      `Análisis iniciado — id: ${analysisId} | file: ${file.originalname} | size: ${file.size}b`
    );

    const image_b64 = file.buffer.toString("base64");
    const image_format = file.mimetype.split("/")[1]; // "image/png" → "png"

    const result = await this.aiClient.predict({
      image_b64,
      image_format,
      metadata: {
        patient_id: metadata.patientId,
        study_type: metadata.studyType,
      },
    });

    this.logger.log(
      `Análisis completado — id: ${analysisId} | prediction: ${result.prediction} | confidence: ${result.confidence}`
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
}
