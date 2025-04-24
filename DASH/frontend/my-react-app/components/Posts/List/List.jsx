import React, { useState, useEffect } from "react";
import axios from "axios";

const List = () => {
    const [posts, setPosts] = useState([]); // Store fetched posts
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/Posts");
                console.log("API Response:", response); // Log the entire response for debugging

                if (response.status === 200 && response.data && Array.isArray(response.data.data)) {
                    setPosts(response.data.data); // Ensure the data is an array
                } else {
                    setError("Unexpected API response format.");
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("An error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container">
            <h1 className="title">Engineering Firms</h1>
            <hr />
            <div className="content">
                {Array.isArray(posts) && posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.post_id} className="parent">
                            {/* Render the first image if available */}
                            {Array.isArray(post.images) && post.images.length > 0 && post.images[0].image && (
                                <img
                                    className="div1"
                                    src={`data:image/jpeg;base64,${post.images[0].image}`}
                                    alt={`${post.account_name} Logo`}
                                    style={{
                                        width: "90%",
                                        aspectRatio: "16/9",
                                        marginBottom: "3%",
                                    }}
                                />
                            )}
                            <div className="div2">
                                <div className="flex-start">
                                    <p>
                                        COMPANY NAME: <strong>{post.account_name}</strong>
                                    </p>
                                </div>
                            </div>
                            <div className="div3">
                                <div className="flex">
                                    <p>LOCATION: {post.location}</p>
                                </div>
                            </div>
                            <div className="div4">
                                <div className="flex">
                                    <p>TITLE: {post.post_title}</p>
                                </div>
                            </div>
                            <div className="div7">
                                <a
                                    href={`/account/company/${post.account_id}`} // Use account_id instead of id
                                    className="more-details"
                                >
                                    View Account{" "}
                                    <i
                                        style={{ color: "#a2aa93" }}
                                        className="fa-sharp-duotone fa-solid fa-arrow-right-long fa-fade fa-2xl"
                                    ></i>
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No posts available.</p>
                )}
            </div>
        </div>
    );
};

export default List;