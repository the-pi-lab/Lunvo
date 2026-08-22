export interface LocalModelInfo {
  id: string;
  name: string;
  engine: 'ollama' | 'lmstudio';
}

export async function discoverLocalModels(): Promise<LocalModelInfo[]> {
  const models: LocalModelInfo[] = [];

  // Try Ollama
  try {
    const ollamaResponse = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      if (data.models && Array.isArray(data.models)) {
        data.models.forEach((m: any) => {
          models.push({ id: m.name, name: m.name, engine: 'ollama' });
        });
      }
    }
  } catch (e) {
    // Ollama not running
  }

  // Try LM Studio
  try {
    const lmStudioResponse = await fetch('http://localhost:1234/v1/models', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (lmStudioResponse.ok) {
      const data = await lmStudioResponse.json();
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((m: any) => {
          models.push({ id: m.id, name: m.id, engine: 'lmstudio' });
        });
      }
    }
  } catch (e) {
    // LM Studio not running
  }

  return models;
}
