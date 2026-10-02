import type {Person} from '../shapes/Person.js';

export interface AvatarProps {
  person?: Person;
  size?: number;
  className?: string;
  alt?: string;
}

export function Avatar(_props: AvatarProps): never {
  throw new Error('@linked.cm/profile Avatar is not implemented yet');
}
