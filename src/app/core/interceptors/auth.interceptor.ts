import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../signals/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const token = auth.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req).pipe(
    catchError((err) => {
      const status = err?.status ?? err?.error?.status;
      if (status === 401) {
        auth.logout();
      } else if (status === 403) {
        router.navigate(['/403']);
      }
      return throwError(() => err);
    }),
  );
};
