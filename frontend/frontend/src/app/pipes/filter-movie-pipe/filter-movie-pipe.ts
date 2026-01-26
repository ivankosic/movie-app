import { Pipe, PipeTransform } from '@angular/core';
import { MovieFull } from '../../model/movie';

@Pipe({ name: 'filterMovie', standalone: true })
export class FilterMoviePipe implements PipeTransform {
  transform(movies: MovieFull[], term: string): MovieFull[] {
    if (!term) return movies;
    const lowerTerm = term.toLowerCase();
    return movies.filter(m => m.movie?.title?.toLowerCase().includes(lowerTerm) 
//    || m.movie?.description?.toLowerCase().includes(lowerTerm) ||
//                              m.movie?.releaseDate?.toLowerCase().includes(lowerTerm) ||
//                              m.movie?.runningTime?.toString().includes(lowerTerm) ||
//                              m.actors?.map(a => a.actor.fullName.includes(lowerTerm)) ||
//                              m.directors?.map(d => d.director.fullName.includes(lowerTerm))
                            );
  }
}
