import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {
  seasonNames: object;
  media: object;
  character: object;

  constructor(private apollo: Apollo) {
    this.seasonNames = {
      'WINTER': 'Talvi',
      'SPRING': 'Kevät',
      'SUMMER': 'Kesä',
      'FALL': 'Syksy',
    }
  }

  ngOnInit() {
    // get random number for picking a random media entry from
    // within the current most popular series
    const getRandom = max => Math.floor(Math.random() * Math.floor(max)),
          page = getRandom(1)

    this.apollo.watchQuery({
      query: gql`query ($type: MediaType, $sort: [MediaSort], $page: Int) {
        Page (perPage: 1, page: $page) {
          media (type: $type, sort: $sort, format_in: [TV, TV_SHORT, MOVIE]) {
            id
            title {
              english
              romaji
            }
            startDate {
              year
            }
            season
            episodes
            source
            characters (perPage: 10, page: 1) {
              nodes {
                name {
                  first
                  last
                }
                image {
                  large
                }
              }
            }
          }
        }
      }`,
      variables: {type: 'ANIME', sort: ['POPULARITY_DESC'], page},
    }).valueChanges.subscribe(result => {
      this.media = result.data && result.data.Page.media[0];

      // Pick a random character among the most popular ones
      const characters = result.data && this.media.characters.nodes;
      this.character = characters && characters[getRandom(characters.length)];
    });
  }

}
