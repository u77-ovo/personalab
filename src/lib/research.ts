export const scoreWeights = { why: 25, who: 20, what: 15, how: 20, validate: 15, next: 5 } as const;
export type ScoreKey = keyof typeof scoreWeights;
export type Scores = Record<ScoreKey, number>;

export function calculateWeightedScore(scores: Scores) {
  const total = (Object.keys(scoreWeights) as ScoreKey[]).reduce((sum, key) => sum + (scores[key] / 5) * scoreWeights[key], 0);
  return Math.round(total * 10) / 10;
}

export type ExtractedEvidence = {
  id: string; participantCode: string; exactQuote: string; line: number;
  startOffset: number; endOffset: number; tag: string; reviewStatus: "pending" | "verified" | "rejected";
  issueId?: string; relation: "supports" | "contradicts" | "uncertain";
};

export function extractEvidence(source: string, participantCode = "P01"): ExtractedEvidence[] {
  let cursor = 0;
  return source.split(/\r?\n/).flatMap((raw, index) => {
    const lineStart = source.indexOf(raw, cursor); cursor = Math.max(lineStart + raw.length, cursor);
    if (!/^(受访者|用户|participant|p\d+)\s*[：:]/i.test(raw.trim())) return [];
    const exactQuote = raw.trim().replace(/^(受访者|用户|participant|p\d+)\s*[：:]\s*/i, "");
    if (!exactQuote) return [];
    const startOffset = source.indexOf(exactQuote, Math.max(0, lineStart));
    const tag = /不知道|区别|犹豫|不确定/.test(exactQuote) ? "理解与决策" : /权限|隐私|保存|用途/.test(exactQuote) ? "信任与隐私" : /按钮|入口|找不到|图标/.test(exactQuote) ? "可发现性" : "使用体验";
    return [{ id: `E-${index + 1}-${startOffset}`, participantCode, exactQuote, line: index + 1, startOffset, endOffset: startOffset + exactQuote.length, tag, reviewStatus: "pending" as const, relation: "uncertain" as const }];
  });
}

export function validateEvidence(source: string, evidence: Pick<ExtractedEvidence, "exactQuote" | "startOffset" | "endOffset">) {
  if (evidence.startOffset < 0 || evidence.endOffset > source.length || evidence.endOffset <= evidence.startOffset) return false;
  return source.slice(evidence.startOffset, evidence.endOffset) === evidence.exactQuote;
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
