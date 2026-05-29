import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom, timeout, retry, catchError } from "rxjs";
import { AxiosError } from "axios";
import { AnalysisResult } from "../analysis/dto/analysis-result.dto";

interface PredictPayload {
  image_b64: string;
  image_format: string;
  metadata: {
    patient_id: string;
    study_type: string;
    dimensions_original?: { w: number; h: number };
  };
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly aiServiceUrl =
    process.env.AI_SERVICE_URL ?? "http://localhost:8000";

  constructor(private readonly httpService: HttpService) {}

  async predictWithCam(payload: PredictPayload): Promise<AnalysisResult> {
    return this._call(`${this.aiServiceUrl}/predict-with-cam`, payload);
  }

  async predict(payload: PredictPayload): Promise<AnalysisResult> {
    return this._call(`${this.aiServiceUrl}/predict`, payload);
  }

  private async _call(url: string, payload: PredictPayload): Promise<AnalysisResult> {
    this.logger.log(`Llamando a AI service: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<AnalysisResult>(url, payload).pipe(
          timeout(25000),
          retry({ count: 2, delay: 1000 }),
          catchError((err: AxiosError) => {
            throw err;
          })
        )
      );
      return response.data;
    } catch (err) {
      const axiosErr = err as AxiosError;

      if (axiosErr.code === "ECONNREFUSED" || axiosErr.code === "ETIMEDOUT") {
        this.logger.error(`AI service no disponible: ${axiosErr.message}`);
        throw new ServiceUnavailableException(
          "El servicio de IA no está disponible. Intentá de nuevo en unos segundos."
        );
      }

      if (axiosErr.response?.status === 422) {
        this.logger.warn(`AI service rechazó la imagen: ${JSON.stringify(axiosErr.response.data)}`);
        throw new ServiceUnavailableException(
          "La imagen no pudo ser procesada por el modelo."
        );
      }

      this.logger.error(`Error inesperado desde AI service: ${axiosErr.message}`);
      throw new ServiceUnavailableException("Error interno del servicio de IA.");
    }
  }
}
