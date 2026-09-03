export const APP_NAME = 'TransplantFlow AI';
export const APP_TAGLINE = 'Intelligent Organ Transplant Coordination & Cold-Ischemia Risk Prediction Platform';

export const MEDICAL_DISCLAIMER = 
  'TransplantFlow AI is a software prototype and clinical decision-support demonstration. ' +
  'It does NOT autonomously allocate organs, make final transplant decisions, replace physicians, ' +
  'or substitute authorized organ procurement policies (UNOS/Eurotransplant). Uses synthetic data only.';

export const ORGAN_MAX_PRESERVATION_MINUTES: Record<string, number> = {
  Heart: 240,     // 4 hours
  Lung: 360,      // 6 hours
  Liver: 720,     // 12 hours
  Kidney: 1440,   // 24 hours
  Pancreas: 720,  // 12 hours
  Intestine: 480, // 8 hours
};

export const ORGAN_ICONS: Record<string, string> = {
  Heart: '❤️',
  Lung: '🫁',
  Liver: '🧬',
  Kidney: '🫘',
  Pancreas: '🥞',
  Intestine: '🌀',
};
