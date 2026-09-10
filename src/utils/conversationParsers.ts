import type { ImportedConversation, ImportedMessage, ConversationPlatform, ConversationFormat } from '../types';

/**
 * Normalizes speaker identity to 'user' | 'assistant' | 'system'
 */
export function normalizeRole(rawRole: string): 'user' | 'assistant' | 'system' {
  const lower = (rawRole || '').toLowerCase().trim();
  if (
    lower === 'user' || 
    lower === 'human' || 
    lower === 'operator' || 
    lower === 'me' || 
    lower === 'person' ||
    lower === 'client' ||
    lower === 'commander'
  ) {
    return 'user';
  }
  if (
    lower === 'assistant' || 
    lower === 'model' || 
    lower === 'ai' || 
    lower === 'bot' || 
    lower === 'chatgpt' || 
    lower === 'claude' || 
    lower === 'gemini' || 
    lower === 'agent' ||
    lower === 'supervisor'
  ) {
    return 'assistant';
  }
  return 'system';
}

/**
 * Extracts key operational topics from conversation messages
 */
export function extractKeyTopics(messages: ImportedMessage[]): string[] {
  const allText = messages.map(m => m.content).join(' ');
  const keywords = [
    'SCADA', 'Grid', 'Telemetry', 'Zero-Day', 'Containment', 'NERC', 'Substation',
    'Isolation', 'Kernel', 'Vulnerability', 'Protocol', 'Consensus', 'Decentralized',
    'Safety', 'Audit', 'Encryption', 'Latency', 'eBPF', 'Failover', 'Infrastructure',
    'Compliance', 'Security', 'Breaker', 'Thermal', 'Harmonics', 'Mesh', 'Pipeline'
  ];

  const found: string[] = [];
  for (const kw of keywords) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(allText)) {
      found.push(kw);
      if (found.length >= 5) break;
    }
  }

  return found.length > 0 ? found : ['Operations', 'General AI'];
}

/**
 * Generates an executive summary from conversation dialogue
 */
export function generateSummary(messages: ImportedMessage[]): string {
  if (messages.length === 0) return 'Empty conversation transcript.';
  const firstUser = messages.find(m => m.sender === 'user');
  const firstAssistant = messages.find(m => m.sender === 'assistant');
  
  const userGoal = firstUser ? firstUser.content.slice(0, 140).trim() : 'Operational exploration';
  const aiResolution = firstAssistant ? firstAssistant.content.slice(0, 160).trim() : '';
  
  if (aiResolution) {
    return `Inquiry regarding "${userGoal}...". Synthesis recommendation: "${aiResolution}..."`;
  }
  return `Dialogue centered on: "${userGoal}..." across ${messages.length} exchanges.`;
}

/**
 * Parses JSON conversation files (ChatGPT export, Claude, Gemini, or generic message array)
 */
export function parseJSONConversation(rawJson: string, filename: string = 'imported_conversation.json'): ImportedConversation[] {
  try {
    const data = JSON.parse(rawJson);
    const results: ImportedConversation[] = [];

    // Format A: Standard array of conversations (ChatGPT export)
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        // Check if item is a ChatGPT mapping object
        if (item.mapping) {
          const title = item.title || `ChatGPT Export ${i + 1}`;
          const messages: ImportedMessage[] = [];
          const mappingKeys = Object.keys(item.mapping);

          for (const key of mappingKeys) {
            const node = item.mapping[key];
            if (node?.message && node.message.content) {
              const role = node.message.author?.role;
              if (role === 'system' && !node.message.content.parts?.join(' ').trim()) continue;
              
              const parts = node.message.content.parts || [];
              const text = parts.filter((p: any) => typeof p === 'string').join('\n').trim();
              if (text) {
                messages.push({
                  id: node.message.id || `msg-${messages.length}`,
                  sender: normalizeRole(role),
                  content: text,
                  timestamp: node.message.create_time ? Math.round(node.message.create_time * 1000) : Date.now()
                });
              }
            }
          }

          if (messages.length > 0) {
            const charCount = messages.reduce((acc, m) => acc + m.content.length, 0);
            results.push({
              id: `conv-json-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`,
              title,
              platform: 'chatgpt',
              sourceFormat: 'json',
              createdAt: item.create_time ? Math.round(item.create_time * 1000) : Date.now(),
              importedAt: Date.now(),
              messageCount: messages.length,
              characterCount: charCount,
              messages,
              summary: generateSummary(messages),
              keyTopics: extractKeyTopics(messages),
              activeForContext: true
            });
          }
        } 
        // Array of simple messages: [{ role, content }, ...]
        else if (item.role || item.sender || item.content || item.text) {
          // This entire array is a single conversation
          const messages = data.map((m: any, idx: number) => ({
            id: `msg-${idx}`,
            sender: normalizeRole(m.role || m.sender || 'user'),
            content: String(m.content || m.text || ''),
            timestamp: m.timestamp || Date.now()
          })).filter(m => m.content.trim().length > 0);

          if (messages.length > 0) {
            const charCount = messages.reduce((acc, m) => acc + m.content.length, 0);
            return [{
              id: `conv-json-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              title: filename.replace(/\.json$/i, ''),
              platform: 'custom',
              sourceFormat: 'json',
              createdAt: Date.now(),
              importedAt: Date.now(),
              messageCount: messages.length,
              characterCount: charCount,
              messages,
              summary: generateSummary(messages),
              keyTopics: extractKeyTopics(messages),
              activeForContext: true
            }];
          }
        }
      }

      if (results.length > 0) return results;
    }

    // Format B: Claude export format ({ chat_messages: [...] })
    if (data.chat_messages && Array.isArray(data.chat_messages)) {
      const messages: ImportedMessage[] = data.chat_messages.map((m: any, idx: number) => ({
        id: `claude-msg-${idx}`,
        sender: normalizeRole(m.sender || m.role),
        content: String(m.text || m.content || ''),
        timestamp: m.created_at ? new Date(m.created_at).getTime() : Date.now()
      })).filter(m => m.content.trim().length > 0);

      const charCount = messages.reduce((acc, m) => acc + m.content.length, 0);
      return [{
        id: `conv-claude-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: data.name || filename.replace(/\.json$/i, ''),
        platform: 'claude',
        sourceFormat: 'json',
        createdAt: Date.now(),
        importedAt: Date.now(),
        messageCount: messages.length,
        characterCount: charCount,
        messages,
        summary: generateSummary(messages),
        keyTopics: extractKeyTopics(messages),
        activeForContext: true
      }];
    }

    // Format C: Standard { messages: [...] }
    if (data.messages && Array.isArray(data.messages)) {
      const messages: ImportedMessage[] = data.messages.map((m: any, idx: number) => ({
        id: m.id || `msg-${idx}`,
        sender: normalizeRole(m.role || m.sender),
        content: String(m.content || m.text || ''),
        timestamp: m.timestamp || Date.now()
      })).filter(m => m.content.trim().length > 0);

      const charCount = messages.reduce((acc, m) => acc + m.content.length, 0);
      return [{
        id: `conv-json-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: data.title || filename.replace(/\.json$/i, ''),
        platform: (data.platform as ConversationPlatform) || 'custom',
        sourceFormat: 'json',
        createdAt: data.createdAt || Date.now(),
        importedAt: Date.now(),
        messageCount: messages.length,
        characterCount: charCount,
        messages,
        summary: data.summary || generateSummary(messages),
        keyTopics: extractKeyTopics(messages),
        activeForContext: true
      }];
    }

    throw new Error('Unrecognized JSON conversation structure');
  } catch (err: any) {
    console.error('Failed to parse JSON conversation:', err);
    throw new Error(`JSON parse failure: ${err?.message || 'Invalid format'}`);
  }
}

/**
 * Parses plain text transcript (.txt) with speaker tags
 */
export function parseTXTConversation(rawTxt: string, filename: string = 'transcript.txt'): ImportedConversation {
  const lines = rawTxt.split(/\r?\n/);
  const messages: ImportedMessage[] = [];
  
  let currentSender: 'user' | 'assistant' | 'system' = 'user';
  let currentBuffer: string[] = [];

  // Patterns matching speaker headers:
  // "User:", "Assistant:", "Human:", "AI:", "[2024-01-01] Operator:", "### User", "**Assistant:**"
  const speakerRegex = /^(?:\[.*?\]\s*)?(?:###\s*|\*\*)?(User|Human|Operator|Commander|Client|Me|Assistant|Claude|ChatGPT|Gemini|AI|Model|System|Bot)(?:\*\*)?[:\-]\s*(.*)$/i;

  const flushBuffer = () => {
    if (currentBuffer.length > 0) {
      const content = currentBuffer.join('\n').trim();
      if (content.length > 0) {
        messages.push({
          id: `msg-${messages.length}`,
          sender: currentSender,
          content,
          timestamp: Date.now() - (1000 * (100 - messages.length))
        });
      }
      currentBuffer = [];
    }
  };

  for (const line of lines) {
    const match = line.match(speakerRegex);
    if (match) {
      flushBuffer();
      currentSender = normalizeRole(match[1]);
      if (match[2] && match[2].trim()) {
        currentBuffer.push(match[2].trim());
      }
    } else {
      currentBuffer.push(line);
    }
  }
  flushBuffer();

  // If no speaker tags were found, split paragraphs or treat as single prompt/response
  if (messages.length === 0 && rawTxt.trim()) {
    const paragraphs = rawTxt.split(/\n\s*\n/).filter(p => p.trim());
    if (paragraphs.length >= 2) {
      messages.push({
        id: 'msg-0',
        sender: 'user',
        content: paragraphs[0].trim(),
        timestamp: Date.now()
      });
      messages.push({
        id: 'msg-1',
        sender: 'assistant',
        content: paragraphs.slice(1).join('\n\n').trim(),
        timestamp: Date.now()
      });
    } else {
      messages.push({
        id: 'msg-0',
        sender: 'user',
        content: rawTxt.trim(),
        timestamp: Date.now()
      });
    }
  }

  const charCount = messages.reduce((acc, m) => acc + m.content.length, 0);
  const detectedPlatform: ConversationPlatform = 
    rawTxt.toLowerCase().includes('claude') ? 'claude' :
    rawTxt.toLowerCase().includes('chatgpt') || rawTxt.toLowerCase().includes('gpt-') ? 'chatgpt' :
    rawTxt.toLowerCase().includes('gemini') ? 'gemini' : 'custom';

  return {
    id: `conv-txt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: filename.replace(/\.txt$/i, '').replace(/[_-]/g, ' '),
    platform: detectedPlatform,
    sourceFormat: 'txt',
    createdAt: Date.now(),
    importedAt: Date.now(),
    messageCount: messages.length,
    characterCount: charCount,
    messages,
    summary: generateSummary(messages),
    keyTopics: extractKeyTopics(messages),
    activeForContext: true
  };
}

/**
 * Parses CSV conversation file (.csv)
 * Handles columns: role,content | sender,text | speaker,message | author,body
 */
export function parseCSVConversation(rawCsv: string, filename: string = 'conversation.csv'): ImportedConversation {
  // Simple robust CSV tokenizer handling commas and quoted multiline fields
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < rawCsv.length; i++) {
    const char = rawCsv[i];
    const nextChar = rawCsv[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) {
    throw new Error('CSV file is empty');
  }

  const header = rows[0].map(h => h.toLowerCase());
  let roleIdx = header.findIndex(h => h.includes('role') || h.includes('sender') || h.includes('speaker') || h.includes('author'));
  let contentIdx = header.findIndex(h => h.includes('content') || h.includes('text') || h.includes('message') || h.includes('body'));

  // Default fallback if headers are not recognized
  if (roleIdx === -1) roleIdx = 0;
  if (contentIdx === -1) contentIdx = header.length > 1 ? 1 : 0;

  const dataRows = rows.slice(1);
  const messages: ImportedMessage[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rawRole = row[roleIdx] || 'user';
    const text = row[contentIdx] || '';
    if (text.trim().length > 0) {
      messages.push({
        id: `csv-msg-${i}`,
        sender: normalizeRole(rawRole),
        content: text.trim(),
        timestamp: Date.now() - (1000 * (dataRows.length - i))
      });
    }
  }

  const charCount = messages.reduce((acc, m) => acc + m.content.length, 0);

  return {
    id: `conv-csv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: filename.replace(/\.csv$/i, '').replace(/[_-]/g, ' '),
    platform: 'custom',
    sourceFormat: 'csv',
    createdAt: Date.now(),
    importedAt: Date.now(),
    messageCount: messages.length,
    characterCount: charCount,
    messages,
    summary: generateSummary(messages),
    keyTopics: extractKeyTopics(messages),
    activeForContext: true
  };
}

/**
 * Extracts textual content from PDF ArrayBuffer via PDF text streams
 */
export function extractTextFromPDFBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let text = '';
  
  // Method 1: Decode Latin1 / UTF-8 text representation of the PDF
  const decoder = new TextDecoder('latin1');
  const pdfString = decoder.decode(bytes);

  // Search for stream blocks or text operators:
  // BT ... ET (Begin Text ... End Text)
  const btRegex = /BT[\s\S]*?ET/g;
  const matches = pdfString.match(btRegex);

  if (matches && matches.length > 0) {
    for (const block of matches) {
      // Find (Text) Tj or [ (Text1) (Text2) ] TJ
      const tjMatches = block.match(/\((.*?)\)\s*Tj/g);
      if (tjMatches) {
        for (const tm of tjMatches) {
          const inner = tm.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
          text += inner + ' ';
        }
        text += '\n';
      }

      // TJ array matching
      const arrayMatches = block.match(/\[(.*?)\]\s*TJ/g);
      if (arrayMatches) {
        for (const am of arrayMatches) {
          const innerStrings = am.match(/\((.*?)\)/g);
          if (innerStrings) {
            for (const s of innerStrings) {
              text += s.slice(1, -1);
            }
            text += ' ';
          }
        }
        text += '\n';
      }
    }
  }

  // Method 2: If stream decoding was sparse, scan for raw printable ASCII strings
  if (text.trim().length < 50) {
    const rawMatches = pdfString.match(/[A-Za-z0-9\s.,!?:;'"()\/\-]{6,}/g);
    if (rawMatches) {
      // Filter out PDF internal commands like /Font, /Obj, /Length, etc.
      const filtered = rawMatches.filter(chunk => 
        !chunk.startsWith('/') && 
        !chunk.includes('endobj') && 
        !chunk.includes('endstream') &&
        !chunk.includes('Filter') &&
        !chunk.includes('FlateDecode')
      );
      text = filtered.join('\n');
    }
  }

  return text.trim();
}

/**
 * High-level parser that routes file by extension / type
 */
export async function parseUploadedFile(file: File): Promise<ImportedConversation[]> {
  const filename = file.name;
  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith('.json')) {
    const text = await file.text();
    return parseJSONConversation(text, filename);
  }

  if (lowerName.endsWith('.txt')) {
    const text = await file.text();
    return [parseTXTConversation(text, filename)];
  }

  if (lowerName.endsWith('.csv')) {
    const text = await file.text();
    return [parseCSVConversation(text, filename)];
  }

  if (lowerName.endsWith('.pdf')) {
    // Read ArrayBuffer
    const buffer = await file.arrayBuffer();
    
    // First attempt server-side parse via API if reachable (which uses Gemini or advanced PDF handling)
    try {
      // Convert buffer to base64
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const res = await fetch('/api/conversations/parse-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          mimeType: 'application/pdf',
          dataBase64: base64
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversations && Array.isArray(data.conversations)) {
          return data.conversations;
        }
      }
    } catch (e) {
      console.warn('Server PDF parse endpoint unavailable, using local stream decoder:', e);
    }

    // Fallback: Local stream extraction
    const extractedText = extractTextFromPDFBuffer(buffer);
    if (!extractedText) {
      throw new Error('Could not extract readable text stream from PDF.');
    }
    const conv = parseTXTConversation(extractedText, filename);
    conv.sourceFormat = 'pdf';
    return [conv];
  }

  // Generic fallback
  const text = await file.text();
  return [parseTXTConversation(text, filename)];
}
