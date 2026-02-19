import { Injectable, signal, computed } from '@angular/core';
import { GeneratedContent, ContentType, Article } from '../../../shared/models';
import { loadFromStorage, saveToStorage } from '../../../core/services/storage.helper';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly STORAGE_KEY = 'trt-generated-contents'

  // --- Private signals (only the service can mutate) ---
  private readonly _generatedContents = signal<GeneratedContent[]>(
    loadFromStorage<GeneratedContent[]>(this.STORAGE_KEY, [])
  );
  private readonly _isGenerating = signal(false);
  private readonly _lastGenerated = signal<GeneratedContent | null>(null);
  private readonly _currentProjectId = signal<string | null>(null);
}
