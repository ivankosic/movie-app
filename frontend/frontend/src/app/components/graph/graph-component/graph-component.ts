import { AfterViewChecked, AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MovieService } from '../../../services/movie/movie-service';
import { Router } from '@angular/router';
import { MovieFull, MovieRecommendation } from '../../../model/movie';
import { Network, Edge, Node, Options } from 'vis-network';
import { DataSet } from 'vis-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-graph',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './graph-component.html',
  styleUrls: ['./graph-component.css'],
})
export class GraphComponent implements AfterViewInit, OnChanges {
  @ViewChild('networkContainer', { static: false })
  networkContainer!: ElementRef<HTMLDivElement>;

  @Input() movie: MovieFull | null = null;
  @Input() recommendations: MovieRecommendation[] = [];

  private network?: Network;
  private initialized = false;

  constructor(private router: Router) { }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.buildGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && (changes['movie'] || changes['recommendations'])) {
      this.buildGraph();
    }
  }

  private buildGraph(): void {
    if (!this.networkContainer?.nativeElement || !this.movie?.movie) return;

    const centerMovie = this.movie.movie;
    const centerId = centerMovie._id;

    const nodes: Node[] = [
      {
        id: centerId,
        label: centerMovie.title,
        shape: 'circularImage',
        image: centerMovie.imageUrl,
        size: 50,
        font: {
          color: '#fff',
          size: 16,
          strokeWidth: 2,
          strokeColor: '#000'
        }
      }
    ];

    const edges: Edge[] = [];

    this.recommendations.forEach(r => {
      if (!r.movie) return;

      nodes.push({
        id: r.movie._id,
        label: r.movie.title,
        shape: 'circularImage',
        image: r.movie.imageUrl,
        size: 30,
        font: {
          color: '#fff',
          size: 12,
          strokeWidth: 2,
          strokeColor: '#000'
        }
      });

      edges.push({
        from: centerId,
        to: r.movie._id
      });
    });

    const data = {
      nodes: new DataSet(nodes),
      edges: new DataSet(edges)
    };

    const options: Options = {
      physics: {
        stabilization: true
      },
      nodes: {
        borderWidth: 2
      },
      edges: {
        color: '#999'
      },
      layout: {
        improvedLayout: true
      }
    };

    if (this.network) {
      this.network.destroy();
    }

    this.network = new Network(
      this.networkContainer.nativeElement,
      data,
      options
    );

    this.registerClickHandler();
  }

  private registerClickHandler(): void {
    if (!this.network) return;

    this.network.on('click', params => {
      if (!params.nodes.length) return;

      const moviePath = params.nodes[0]; // "movie/64117"
      this.router.navigateByUrl(`/movies/${moviePath}`);
    });
  }
}
