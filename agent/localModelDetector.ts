// agent/localModelDetector.ts

export interface LocalModelInfo {
  name: string;
  provider: 'ollama' | 'lmstudio' | 'local';
  baseURL: string;
}

/**
 * Automatically scans the user's local PC for downloaded Ollama and LM Studio models.
 */
export async function detectLocalModels(): Promise<LocalModelInfo[]> {
  const detectedModels: LocalModelInfo[] = [];

  // 1. Check Ollama API (http://localhost:11434/api/tags)
  try {
    const res = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        for (const model of data.models) {
          detectedModels.push({
            name: model.name,
            provider: 'ollama',
            baseURL: 'http://localhost:11434/v1',
          });
        }
      }
    }
  } catch (err) {
    console.log('Ollama not running or not detected on localhost:11434');
  }

  // 2. Check LM Studio / Local OpenAI API (http://localhost:1234/v1/models)
  try {
    const res = await fetch('http://localhost:1234/v1/models', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        for (const model of data.data) {
          detectedModels.push({
            name: model.id,
            provider: 'lmstudio',
            baseURL: 'http://localhost:1234/v1',
          });
        }
      }
    }
  } catch (err) {
    console.log('LM Studio not running or not detected on localhost:1234');
  }

  return detectedModels;
}
