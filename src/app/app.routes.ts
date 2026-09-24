import { Route } from "@angular/router";
import {canActivateAuthRole} from "@shared/guards/auth-guard";
import {homeRedirectGuard} from "@shared/guards/home-redirect-guard";

export const routes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./echo/echo-tier-home/echo-tier-home.component').then(
        (m) => m.EchoTierHomeComponent
      ),
    canActivate: [canActivateAuthRole],
  },
  {
    path: 'main-home',
    canActivate: [homeRedirectGuard],
    component: class {} // Dummy component necessary to register the route
  },
  {
    path: 'echo',
    loadComponent: () =>
      import('./echo/echo-tier/echo-tier.component').then(
        (m) => m.EchoTierComponent
      ),
    canActivate: [canActivateAuthRole],
  },
  {
    path: 'agent-configuration',
    loadComponent: () =>
      import('./agent-configuration/agent-configuration.component').then(
        (m) => m.AgentConfigurationComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ['ONBOARDER_M'] },
  },
  {
    path: 'agent-configuration/keypair/:id',
    loadComponent: () =>
      import(
        './agent-configuration/keypair-details/keypair-details.component'
        ).then((m) => m.KeypairDetailsComponent),
    canActivate: [canActivateAuthRole],
    data: { roles: ['ONBOARDER_M'] },
  },
  {
    path: 'ping',
    loadComponent: () =>
      import('./ping/ping.component').then((m) => m.PingComponent),
    canActivate: [canActivateAuthRole],
  },
  {
    path: "unauthorized",
    loadComponent: () =>
      import("@fe-simpl/landing-page").then((m) => m.UnauthorizedPageComponent)
  },
  {
    path: "error",
    loadComponent: () =>
      import("@fe-simpl/landing-page").then((m) => m.ErrorPageComponent)
  }
];
