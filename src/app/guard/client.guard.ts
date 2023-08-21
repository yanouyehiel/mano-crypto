import { CanActivateFn } from '@angular/router';

export const clientGuard: CanActivateFn = (route, state) => {
  return true;
};
