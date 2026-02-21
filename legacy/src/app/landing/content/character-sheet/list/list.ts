import { Component, HostBinding, Input } from '@angular/core';

type Item = {
  name: string;
  percent: number;
  color: string;
};

@Component({
  selector: 'app-list',
  imports: [],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  @HostBinding('class') readonly cls = /* tw */ 'block w-full';

  @Input({ required: true })
  items: Item[] = [];
}
