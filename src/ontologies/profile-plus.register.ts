import * as terms from './profile-plus.js';
import {linkedOntology} from '../package.js';

linkedOntology(
  terms,
  terms.ns,
  'profile-plus',
  terms.loadData,
  '../data/profile-plus.json'
);
