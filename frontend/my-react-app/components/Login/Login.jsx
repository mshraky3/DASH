import React, { useState   } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const Login =  () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const login = await axios.post('http://localhost:3000/api/login', {
                email,
                password
            })
            switch (login.status) {
                case 200:
                    navigate('/' , { state: { message: 'welcome login sessifal' , isUser:true } });                   break;
                case 201:
                    navigate('/register' , { state: { message: 'regster first' } });
                    break;
                default:
                    navigate('/register' , { state: { message: 'User dosnt exists' } });
                    break;
            }
        } catch (error) {
            console.error('Error during login:', error);
        }

    };



    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" >Login</button>
            </form>
        </div>
    );
};

export default Login;