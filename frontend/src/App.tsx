import routes from './routes/routes';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

function App() {
    return (
        <>
            <Router>
                <Routes>
                    {routes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.element} />
                    ))}
                </Routes>
            </Router>
            <Toaster />
        </>
    );
}

export default App;
