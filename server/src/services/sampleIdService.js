import { getCollection, updateCollection, getDbData } from '../models/dbAdapter.js';

export function generateSampleId() {
  const dbData = getDbData();
  const settings = dbData.settings || { idPrefix: 'LAB-', currentSequence: 1000 };
  const year = new Date().getFullYear();

  // Find existing samples to calculate next sequential number
  const samples = getCollection('samples');
  let maxNum = 0;

  for (const s of samples) {
    if (s.sampleId) {
      const match = s.sampleId.match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }

  const nextSeq = Math.max(maxNum + 1, settings.currentSequence || 1);
  settings.currentSequence = nextSeq + 1;

  const paddedNum = String(nextSeq).padStart(4, '0');
  const prefix = settings.idPrefix || 'LAB-';
  return `${prefix}${year}-${paddedNum}`;
}
