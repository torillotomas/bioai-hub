import { IsString, IsIn, IsOptional } from "class-validator";

export class CreateAnalysisDto {
  @IsString()
  patientId!: string;

  @IsIn(["chest_xray", "mri", "ct"])
  studyType!: "chest_xray" | "mri" | "ct";

  @IsOptional()
  @IsString()
  notes?: string;
}
