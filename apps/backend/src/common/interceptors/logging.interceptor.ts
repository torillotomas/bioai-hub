import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { Request } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const correlationId =
      (req.headers["x-correlation-id"] as string) ?? crypto.randomUUID();
    const start = Date.now();

    req.headers["x-correlation-id"] = correlationId;

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(
          `[${correlationId}] ${req.method} ${req.url} → ${ms}ms`
        );
      })
    );
  }
}
