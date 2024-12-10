import React from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="home-page">
            <div className="card-container">
                <div className="card">
                    <div className="card-content">
                        <p>Топологічне сортування</p>
                    </div>
                    <Link className="start-button" to="/graph">Start</Link>
                </div>
                <div className="card">
                    <div className="card-content">
                        <p>АВЛ дерево</p>
                    </div>
          
                    <Link className="start-button" to="#">Start</Link>
                </div>
            </div>
            <footer className="footer">
                <p>Internet of Things</p>
                <p>2024</p>
            </footer>
        </div>
    );
};

export default HomePage;
