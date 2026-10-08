import type {HTMLAttributes, ReactNode} from 'react';
import {linkedComponent} from '../package.js';
import {Person} from '../shapes/Person.js';
import {profileImageUrl} from './profileImageUrl.js';
import styles from './Avatar.module.css';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'medium' | 'large' | number;
  overwriteSource?: string;
  fallback?: ReactNode;
}

const query = Person.select((person) => ({
  cropped: person.profilePicture?.cropped?.contentUrl,
  original: person.profilePicture?.image?.contentUrl,
  givenName: person.givenName,
}));

/**
 * Primary picture for any Person. Source order is `overwriteSource`, then the
 * cropped image, then the original, then `fallback` or the first letter of
 * `givenName`. It only reads that query.
 */

export const Avatar = linkedComponent<typeof query, AvatarProps>(
  query,
  ({cropped, original, givenName, overwriteSource, fallback, size = 'medium', className, ...rest}: any) => {
    const source = overwriteSource || profileImageUrl(cropped) || profileImageUrl(original);
    const pixels = typeof size === 'number' ? size : size === 'small' ? 48 : size === 'large' ? 96 : 64;
    if (!source && fallback) return <>{fallback}</>;

    return (
      <div
        {...rest}
        className={[styles.root, className].filter(Boolean).join(' ')}
        style={{width: pixels, height: pixels, ...rest.style}}
      >
        {source ? (
          <img className={styles.image} src={source} alt={givenName || 'Profile picture'} />
        ) : (
          <span className={styles.initials} aria-label={givenName || 'No profile picture'}>
            {(givenName || '?').slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
    );
  }
);
