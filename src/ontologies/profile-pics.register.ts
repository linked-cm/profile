import * as terms from './profile-pics.js';
import {linkedOntology} from '../package.js';

linkedOntology(
  terms,
  terms.ns,
  'profile-pics',
  terms.loadData,
  '../data/profile-pics.json'
);
