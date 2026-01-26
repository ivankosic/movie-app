import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Movie, MovieFull, MoviePageResponse, MovieRecommendation } from '../../model/movie';
import { environment } from '../../environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private url = `${environment.baseUrl}/movies`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<MovieFull[]>(this.url);
  }

  getAllActive(page = 0, pageSize = 10) {
    return this.http.get<MoviePageResponse>(
    `${environment.baseUrl}/movies/active`,
    {
      params: {
        page,
        pageSize
      }
    });
  }

  getById(id: string | number) {
    return this.http.get<MovieFull>(`${this.url}/${id}`);
  }

  create(t: Movie) {
    return this.http.post<Movie>(`${this.url}`, t);
  }

  update(t: Movie, id: string | number) {
    return this.http.put<MovieFull>(`${this.url}`, t);
  }

  delete(id: string | number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  softDelete(id: string | number) {
    return this.http.delete<void>(`${this.url}/softDelete/${id}`);
  }

  search(params : any) {
    return this.http.post<MovieFull[]>(
      `${this.url}/search`,params);
  }

  recommend(id: string | number): Observable<MovieRecommendation[]> {
    return this.http.get<MovieRecommendation[][]>(`${this.url}/${id}/recommend`).pipe(
      map((res: MovieRecommendation[][]) => res.flat())
    );
  }
}
