import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = (props) => {
    return (
        <>
            <nav>
                <ul className='nav-list'>
                    {/* Logo and DASH */}
                    <li className='logo-cont'>
                        <div className='logo'>
                            <Link className="dash-text">DASH</Link>
                        </div>
                    </li>

                    {/* Links Container */}
                    <li className='links-cont'>
                        <div className='links-cot'>
                            <Link className="nav-link">مكاتب هندسية</Link>
                            <Link className="nav-link">مقاولات</Link>
                            <Link className="nav-link">افراد</Link>
                            {props.isUser ? (
                                <Link className="nav-link" to='/login'>profile</Link>
                            ) : (
                                <>
                                    <Link className="nav-link" to='/login'>login</Link>
                                    <Link className="nav-link" to='/register'>sign up</Link>
                                </>
                            )}
                        </div>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default Navbar;