import { Landing } from '@/pages/Landing';

type RouteConfig = {
    path: string;
    element: React.ReactNode;
    protected?: boolean;
    roles?: string[];
};

const routes: RouteConfig[] = [
    {
        path: '/',
        element: <Landing />,
    },
];

export default routes;
