// Ported from net/goldtreeservers/NestedError.as

import { $reg } from '../refs.ts';

export class NestedError extends Error {
  declare error: Error;
  getStackTrace(): string {
         return super.getStackTrace() + "\n" + this.error.getStackTrace();
      }
  constructor(message: string, error: Error) {
         super(message);
         this.error = error;
      }
}
$reg('net.goldtreeservers.NestedError', NestedError);
