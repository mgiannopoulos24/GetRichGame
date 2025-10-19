import routes from './routes/routes';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

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
        </>
    );
}

export default App;
