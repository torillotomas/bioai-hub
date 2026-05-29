import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("analyses")
export class Analysis {
  @PrimaryColumn()
  analysis_id!: string;

  @Column()
  patient_id!: string;

  @Column()
  study_type!: string;

  @Column()
  prediction!: string;

  @Column("float")
  confidence!: number;

  @Column("simple-json")
  class_scores!: Record<string, number>;

  @Column()
  model_version!: string;

  @Column("int")
  inference_time_ms!: number;

  @Column()
  image_hash_sha256!: string;

  @Column({ nullable: true, type: "text" })
  user_id!: string | null;

  @Column({ nullable: true, type: "text" })
  heatmap_b64!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
