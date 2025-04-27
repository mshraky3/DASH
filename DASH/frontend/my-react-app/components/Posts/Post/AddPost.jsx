import React, { useState } from 'react';

const AddPost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title && content) {
            onAddPost({ title, content });
            setTitle('');
            setContent('');
        }
    };

    
    return (
        <div>
            <h2>Add New Post</h2>
                <button type="submit">Add Post</button>
            
        </div>
    );
};

export default AddPost;