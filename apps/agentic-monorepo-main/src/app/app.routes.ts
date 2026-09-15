import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'dashboard-feature',
    loadChildren: () =>
      import('@agentic/dashboard-feature').then(
        (m) => m.dashboardFeatureRoutes,
      ),
  },
];
