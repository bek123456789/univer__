import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, guestOnly }) => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        return <Navigate to="/" />; // Redirect to login if no logged-in user
    }

    // Check if the user is a guest and not allowed to access certain routes
    if (loggedInUser.role === 'guest' && !guestOnly) {
        return <Navigate to="/clubs" />; // Redirect guests to clubs page
    }

    return children;
};

export default PrivateRoute;
