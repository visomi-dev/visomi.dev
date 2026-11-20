import { Component } from '@angular/core';

import { NavigationHeading } from '../shared/navigation-heading';
import { LinkButton } from '../ui/actions/link-button';
import { Card } from '../ui/layout/card';
import { Heading } from '../ui/typography/heading';
import { Text } from '../ui/typography/text';

@Component({
  selector: 'app-not-found',
  imports: [NavigationHeading, LinkButton, Card, Heading, Text],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {}
