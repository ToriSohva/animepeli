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

  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.apollo.watchQuery({
      query: gql`query ($id: Int, $type: MediaType) {
        Media (id: $id, type: $type) {
          id
          title {
            english
            romaji
          }
        }
      }`,
      variables: {id: 105333, type: 'ANIME'},
    }).valueChanges.subscribe(result => {
      this.media = result.data && result.data.Media;
    });
  }

}
