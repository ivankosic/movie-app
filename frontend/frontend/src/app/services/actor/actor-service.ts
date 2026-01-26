import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actor, ActorFull, ActorPageResponse } from '../../model/actor';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActorService {
  private url = "http://localhost:5000/api/actors";

  constructor(private http: HttpClient) { }

  getAll(): Observable<ActorFull[]> {
    return this.http.get<ActorFull[]>(this.url);
  }

  getAllActive(page = 0, pageSize = 10) {
      return this.http.get<ActorPageResponse>(
      `${this.url}/active`,
      {
        params: {
          page,
          pageSize
        }
      });
    }

  getById(id: string | number): Observable<ActorFull> {
    return this.http.get<ActorFull>(`${this.url}/${id}`);
  }

  create(actor: Actor): Observable<ActorFull> {
    return this.http.post<ActorFull>(this.url, actor);
  }

  update(actor: Actor, id: string | number): Observable<ActorFull> {
    return this.http.put<ActorFull>(`${this.url}/${id}`, actor);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  softDelete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.url}/softDelete/${id}`);
  }

  search(term: string): Observable<ActorFull[]> {
    return this.http.get<ActorFull[]>(`${this.url}/search?term=${term}`);
  }
}
