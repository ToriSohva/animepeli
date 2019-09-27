import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StartComponent } from './components/start/start.component';
import { QuestionComponent } from './components/question/question.component';

const routes: Routes = [
  {path: '', component: StartComponent},
  {path: 'quiz', component: QuestionComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
