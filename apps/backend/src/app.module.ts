import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { AnalysisModule } from "./analysis/analysis.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    AnalysisModule,
  ],
  providers: [
    { provide: APP_FILTER,      useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
