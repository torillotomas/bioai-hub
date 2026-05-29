import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
  Req,
  BadRequestException,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import type { Request } from "express";
import { AnalysisService } from "./analysis.service";
import { CreateAnalysisDto } from "./dto/create-analysis.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE ?? "10485760", 10);

@Controller("analysis")
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get()
  findAll() {
    return this.analysisService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return callback(
            new UnsupportedMediaTypeException(
              `Tipo de archivo no soportado: ${file.mimetype}. Permitidos: JPEG, PNG, WebP.`
            ),
            false
          );
        }
        callback(null, true);
      },
    })
  )
  async create(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body("metadata") metadataRaw: string
  ) {
    if (!file) throw new BadRequestException("Se requiere un archivo de imagen.");

    if (file.size > MAX_FILE_SIZE)
      throw new PayloadTooLargeException(
        `El archivo excede el límite de ${MAX_FILE_SIZE / 1024 / 1024}MB.`
      );

    let metadata: CreateAnalysisDto;
    try {
      metadata = JSON.parse(metadataRaw) as CreateAnalysisDto;
    } catch {
      throw new BadRequestException("El campo 'metadata' debe ser un JSON válido.");
    }

    if (!metadata.patientId || !metadata.studyType)
      throw new BadRequestException("metadata debe incluir patientId y studyType.");

    return this.analysisService.analyze(file, metadata, req.user.userId);
  }
}
