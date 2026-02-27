import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedResponse, FetchMultipleRequest, FeedResult } from '../../shared/models';

/** Thin HTTP client for the RSS backend API. */
@Injectable({ providedIn: 'root' })
export class RssApiService {
  private readonly http = inject(HttpClient);

  fetchFeed(feedUrl: string): Observable<FeedResponse> {
    const encodedUrl = encodeURIComponent(feedUrl);
    return this.http.get<FeedResponse>(`/api/rss/fetch?url=${encodedUrl}`);
  }

  fetchMultipleFeeds(feedUrls: string[]): Observable<FeedResult[]> {
    const body: FetchMultipleRequest = { urls: feedUrls };
    return this.http.post<FeedResult[]>('/api/rss/fetch-multiple', body);
  }
}