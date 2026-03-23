import { Landing } from '@/pages/Landing';
import { Room } from '@/pages/Room';
import { AllRooms } from '@/pages/AllRooms';

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
    {
        path: '/room/:roomId', // Dynamic route for game rooms
        element: <Room />,
    },
    {
        path: '/rooms',
        element: <AllRooms />,
    },
];

export default routes;
