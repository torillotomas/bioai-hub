export const PATHOLOGY_NAMES: Record<string, string> = {
  Atelectasis: "Atelectasia",
  Consolidation: "Consolidación",
  Infiltration: "Infiltración",
  Pneumothorax: "Neumotórax",
  Edema: "Edema",
  Emphysema: "Enfisema",
  Fibrosis: "Fibrosis",
  Effusion: "Derrame pleural",
  Pneumonia: "Neumonía",
  Pleural_Thickening: "Engrosamiento pleural",
  Cardiomegaly: "Cardiomegalia",
  Nodule: "Nódulo",
  Mass: "Masa",
  Hernia: "Hernia",
  "Lung Lesion": "Lesión pulmonar",
  Fracture: "Fractura",
  "Lung Opacity": "Opacidad pulmonar",
  "Enlarged Cardiomediastinum": "Mediastino ensanchado",
};

export function translatePathology(name: string): string {
  return PATHOLOGY_NAMES[name] ?? name;
}
