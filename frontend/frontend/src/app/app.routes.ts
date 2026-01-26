import { Routes } from '@angular/router';
import { GraphViewComponent } from './components/wrappers/graph-view/graph-view-component/graph-view-component';
import { MovieListViewComponent } from './components/wrappers/movie-list-view/movie-list-view-component/movie-list-view-component';
import { MovieDetailsView } from './components/wrappers/movie-details-view/movie-details-view';
import { DirectorDetailsView } from './components/wrappers/director-details-view/director-details-view';
import { ActorDetailsView } from './components/wrappers/actor-details-view/actor-details-view';
import { ActorListView } from './components/wrappers/actor-list-view/actor-list-view';
import { DirectorListView } from './components/wrappers/director-list-view/director-list-view';

export const routes: Routes = [
    { path: '', component: MovieListViewComponent },
    { path: 'movies/movie/:id', component: MovieDetailsView },
    { path: 'movies/movie/:id/recommendations', component: GraphViewComponent },
    { path: 'actors', component: ActorListView },
    { path: 'actor/:id', component: ActorDetailsView },
    { path: 'directors', component: DirectorListView },
    { path: 'director/:id', component: DirectorDetailsView }
];
