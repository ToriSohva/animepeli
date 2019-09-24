import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Media } from '../../models/Media';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {
  media: object;
  character: object;

  constructor(private apollo: Apollo) { }

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
          }
        }
      }`,
      variables: {type: 'ANIME', sort: ['POPULARITY_DESC'], page},
    }).valueChanges.subscribe(result => {
      this.media = result.data && result.data.Page.media[0];
    });
  }

}
