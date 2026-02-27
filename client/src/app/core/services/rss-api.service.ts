import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RssArticleDto, FetchMultipleRequest, FeedResult } from '../../shared/models';

/** Thin HTTP client for the RSS backend API. */
@Injectable({ providedIn: 'root' })
export class RssApiService {
  private readonly http = inject(HttpClient);

  /** GET */
  fetchFeed(feedUrl: string): Observable<RssArticleDto[]> {
    const encodedUrl = encodeURIComponent(feedUrl);
    return this.http.get<RssArticleDto[]>(`/api/rss/fetch?url=${encodedUrl}`);
  }

  /** POST */
  fetchMultipleFeeds(feedUrls: string[]): Observable<FeedResult[]> {
    const body: FetchMultipleRequest = { urls: feedUrls };
    return this.http.post<FeedResult[]>('/api/rss/fetch-multiple', body);
  }
}