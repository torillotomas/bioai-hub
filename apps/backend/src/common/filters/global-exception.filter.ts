import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    const correlationId = (request.headers["x-correlation-id"] as string) ?? "unknown";

    this.logger.error(
      `[${correlationId}] ${request.method} ${request.url} → ${status}: ${message}`
    );

    response.status(status).json({
      statusCode: status,
      error: message,
      path: request.url,
      timestamp: new Date().toISOString(),
      correlationId,
    });
  }
}
