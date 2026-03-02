import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  AiGenerateRequestDto,
  AiGenerateResponseDto,
} from '../../shared/models';

/**
 * Thin HTTP client for the AI generation backend API.
 *
 * Handles only network communication — no state, no business logic.
 * Follows the same SRP pattern as RssApiService.
 *
 * The dev proxy (proxy.conf.json) forwards /api/* to Fastify (port 3000).
 * No additional proxy configuration is needed.
 */
@Injectable({ providedIn: 'root' })
export class AiApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/ai';

  /**
   * Send selected articles to the backend for AI content generation.
   * The backend delegates to the active provider (mock, claude, ollama)
   * based on the AI_PROVIDER environment variable.
   *
   * @param request - Articles and generation type
   * @returns Observable with the generated content
   */
  generate(request: AiGenerateRequestDto): Observable<AiGenerateResponseDto> {
    return this.http.post<AiGenerateResponseDto>(
      `${this.baseUrl}/generate`,
      request
    );
  }
}