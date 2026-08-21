export interface TextChunk {
  index: number;
  text: string;
  tokenCount: number;
}

/**
 * Splits text into overlapping chunks.
 * Target: ~500 tokens (approx 2000 characters) with ~50 tokens (approx 200 characters) overlap.
 */
export function splitTextIntoChunks(
  text: string,
  targetChunkChars: number = 1800,
  overlapChars: number = 200
): TextChunk[] {
  const cleanedText = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!cleanedText) return [];

  const chunks: TextChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanedText.length) {
    let endIndex = startIndex + targetChunkChars;

    if (endIndex < cleanedText.length) {
      // Try to break at a clean sentence or paragraph boundary
      const paragraphBreak = cleanedText.lastIndexOf('\n\n', endIndex);
      const sentenceBreak = cleanedText.lastIndexOf('. ', endIndex);
      const newlineBreak = cleanedText.lastIndexOf('\n', endIndex);

      if (paragraphBreak > startIndex + targetChunkChars * 0.6) {
        endIndex = paragraphBreak + 2;
      } else if (sentenceBreak > startIndex + targetChunkChars * 0.6) {
        endIndex = sentenceBreak + 2;
      } else if (newlineBreak > startIndex + targetChunkChars * 0.6) {
        endIndex = newlineBreak + 1;
      }
    } else {
      endIndex = cleanedText.length;
    }

    const chunkText = cleanedText.slice(startIndex, endIndex).trim();
    if (chunkText.length > 20) {
      // Estimate tokens: ~4 chars per token
      const tokenCount = Math.ceil(chunkText.length / 4);
      chunks.push({
        index: chunkIndex++,
        text: chunkText,
        tokenCount,
      });
    }

    if (endIndex >= cleanedText.length) {
      break;
    }

    // Step forward minus the overlap
    startIndex = Math.max(startIndex + 1, endIndex - overlapChars);
  }

  return chunks;
}
