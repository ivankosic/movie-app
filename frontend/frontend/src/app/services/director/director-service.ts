import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Director, DirectorFull, DirectorPageResponse } from '../../model/director';

@Injectable({
  providedIn: 'root',
})
export class DirectorService {
  private url = "http://localhost:5000/api/directors";

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Director[]>(this.url);
  }

  getAllActive(page = 0, pageSize = 10) {
      return this.http.get<DirectorPageResponse>(
      `${this.url}/active`,
      {
        params: {
          page,
          pageSize
        }
      });
    }

  getById(id: string | number) {
    return this.http.get<DirectorFull>(`${this.url}/${id}`);
  }

  create(t: Director) {
    return this.http.post<Director>(`${this.url}`, t);
  }

  update(t: Director, id: string | number) {
    return this.http.put<Director>(`${this.url}`, t);
  }

  delete(id: string | number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  softDelete(id: string | number) {
    return this.http.delete<void>(`${this.url}/softDelete/${id}`);
  }

  search(term: string) {
    return this.http.get<DirectorFull[]>(`${this.url}/search?term=${term}`);
  }
}
