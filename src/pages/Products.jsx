import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GetPosts = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        // Function to handle login and fetch posts
        const loginAndFetchPosts = async () => {
            try {
                // API login request
                const loginResponse = await axios.post('https://omonullo.uz/api/v1/users/login/', {
                    email: 'a@newuu.uz',
                    password: '111'
                });

                const { access_token, refresh_token } = loginResponse.data;
                console.log('Login successful:', loginResponse.data);

                // Store tokens securely (localStorage example)
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);

                // Make an authenticated request using the access token
                const postsResponse = await axios.get('https://omonullo.uz/api/v1/posts/user/getpost/', {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });
                console.log('Authenticated request successful:', postsResponse.data);

                setPosts(postsResponse.data);  // Assuming the response is a list of posts
                setIsLoading(false);  // Stop loading after posts are fetched
            } catch (error) {
                console.error('Error occurred:', error);
                setError(error.message || 'An error occurred');
                setIsLoading(false);
            }
        };

        loginAndFetchPosts();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Posts</h2>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>{post.title}</li>  // Assuming 'post' has an 'id' and 'title'
                ))}
            </ul>
        </div>
    );
};

export default GetPosts;
