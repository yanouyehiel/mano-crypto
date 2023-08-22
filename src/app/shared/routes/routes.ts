import { Routes } from "@angular/router";

export const content: Routes = [
    {
        path: 'dashboard',
        data: {
            title: 'Dashboard',
            breadcrumb: 'Dashboard'
        },
        loadChildren: () => import('../components/layout/client/client.component').then(m => m.ClientComponent)
    }
]