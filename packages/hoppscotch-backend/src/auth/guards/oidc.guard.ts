import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AUTH_PROVIDER_NOT_SPECIFIED } from 'src/errors';
import { AuthProvider, authProviderCheck, throwHTTPErr } from '../helper';

@Injectable()
export class OidcSSOGuard
  extends AuthGuard('openidconnect')
  implements CanActivate
{
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (!authProviderCheck(AuthProvider.OIDC))
      throwHTTPErr({
        message: AUTH_PROVIDER_NOT_SPECIFIED,
        statusCode: 404,
      });

    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    return {
      state: {
        redirect_uri: req.query.redirect_uri,
      },
    };
  }
}
