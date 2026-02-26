export interface WordData {
  id: number;
  level: string;
  word: string;
  reading_ruby: string;
  search_key: string;
  part_of_speech: string;
  meaning: string;
  usage_chip: string;
  particle: string;
  example_jp: string;
  example_ko: string;
  usage_note: string;
  memo: string;
}

// 레벨별 캐시
const cache: Partial<Record<string, WordData[]>> = {};

/** 특정 레벨의 단어만 fetch (레벨별 JSON 파일) */
export async function loadWordsByLevel(level: string): Promise<WordData[]> {
  if (cache[level]) return cache[level]!;
  const res = await fetch(`/data/words_${level}.json`);
  if (!res.ok) throw new Error(`${level} 단어 데이터를 불러올 수 없습니다.`);
  const data: WordData[] = await res.json();
  cache[level] = data;
  return data;
}

/** 모든 레벨 병렬 fetch */
export async function loadAllWords(): Promise<WordData[]> {
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const results = await Promise.all(levels.map((l) => loadWordsByLevel(l)));
  return results.flat();
}

export function getWordsByLevel(words: WordData[], level: string): WordData[] {
  return words.filter((w) => w.level === level);
}
