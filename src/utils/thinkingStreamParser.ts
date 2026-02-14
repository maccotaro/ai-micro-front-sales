/**
 * 思考モードストリーミングのマーカーパーサー
 *
 * バックエンドが送信する __THINK__...__THINK_END__ マーカーを解析し、
 * 思考トークンと通常コンテンツトークンを分離する。
 */

export interface ThinkingParseResult {
  contentDelta: string;
  thinkingDelta: string;
}

/**
 * バッファからthinkingマーカーをパースし、コンテンツと思考を分離する。
 * 不完全なマーカーはバッファに残す。
 *
 * @param buffer 処理対象のバッファ文字列
 * @returns パース結果と残りのバッファ
 */
export function parseThinkingChunk(
  buffer: string
): { result: ThinkingParseResult; remainingBuffer: string } {
  let pendingBuffer = buffer;
  let contentDelta = '';
  let thinkingDelta = '';

  const THINK_START = '__THINK__';
  const THINK_END = '__THINK_END__';
  const MARKER_MAX_LEN = THINK_START.length + THINK_END.length;

  while (pendingBuffer.length > 0) {
    const thinkStart = pendingBuffer.indexOf(THINK_START);
    const thinkEnd = pendingBuffer.indexOf(THINK_END);

    if (thinkStart === -1 && thinkEnd === -1) {
      // No markers - treat as content, but keep tail for possible incomplete marker
      if (pendingBuffer.length > MARKER_MAX_LEN) {
        contentDelta += pendingBuffer.slice(0, -MARKER_MAX_LEN);
        pendingBuffer = pendingBuffer.slice(-MARKER_MAX_LEN);
      }
      break;
    }

    if (thinkStart !== -1 && (thinkEnd === -1 || thinkStart < thinkEnd)) {
      // __THINK__ found
      contentDelta += pendingBuffer.slice(0, thinkStart);
      if (thinkEnd !== -1) {
        // Complete marker pair
        thinkingDelta += pendingBuffer.slice(
          thinkStart + THINK_START.length,
          thinkEnd
        );
        pendingBuffer = pendingBuffer.slice(thinkEnd + THINK_END.length);
      } else {
        // Incomplete - wait for more data
        pendingBuffer = pendingBuffer.slice(thinkStart);
        break;
      }
    } else if (thinkEnd !== -1) {
      // Orphaned __THINK_END__
      thinkingDelta += pendingBuffer.slice(0, thinkEnd);
      pendingBuffer = pendingBuffer.slice(thinkEnd + THINK_END.length);
    } else {
      break;
    }
  }

  return {
    result: { contentDelta, thinkingDelta },
    remainingBuffer: pendingBuffer,
  };
}

/**
 * ストリーミング完了後に残りバッファをフラッシュする。
 * マーカーを除去し、残りテキストを通常コンテンツとして返す。
 */
export function flushThinkingBuffer(buffer: string): string {
  return buffer.replace(/__THINK__/g, '').replace(/__THINK_END__/g, '');
}
