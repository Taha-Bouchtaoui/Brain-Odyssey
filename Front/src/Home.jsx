import React, { useState, useEffect } from 'react';
import axios from './utils/axios';

import { 
  BsFillArchiveFill, 
  BsFillGrid3X3GapFill, 
  BsPeopleFill, 
  BsFillBellFill 
} from 'react-icons/bs';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

function Home() {

    // 🔹 State for username
    const [username, setUsername] = useState("");

    // 🔹 Fetch user from Django
    useEffect(() => {
        axios.get("/api/settings/")
            .then((res) => {
                setUsername(res.data.username);
            })
            .catch((err) => {
                console.error("Failed to load user:", err);
            });
    }, []);

    // 🔹 Chart data (static for now)
    const data = [
        { name: 'Ex 1', Ex: 10, Erreur: 2 },
        { name: 'Ex 2', Ex: 8, Erreur: 1 },
        { name: 'Ex 3', Ex: 12, Erreur: 3 },
        { name: 'Ex 4', Ex: 15, Erreur: 0 },
        { name: 'Ex 5', Ex: 9, Erreur: 2 },
        { name: 'Ex 6', Ex: 14, Erreur: 1 },
        { name: 'Ex 7', Ex: 11, Erreur: 4 },
    ];

    return (
        <main className='main-container'>
            
            <div className='main-title'>
                <h3>My Adventure Dashboard</h3>
            </div>

            {/* Welcome Message */}
            <div className="welcome-box">
                <h2>
                    Hey {username ? username.charAt(0).toUpperCase() + username.slice(1) : "Champion"}!
                </h2>
                <p>Keep learning and unlocking new worlds!</p>
            </div>

            {/* Cards */}
            <div className='main-cards'>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>Level</h3>
                        <BsFillArchiveFill className='card_icon'/>
                    </div>
                    <h1>7</h1> 
                </div>

                <div className='card'>
                    <div className='card-inner'>
                        <h3>World</h3>
                        <BsFillGrid3X3GapFill className='card_icon'/>
                    </div>
                    <h1>3</h1> 
                </div>

                <div className='card'>
                    <div className='card-inner'>
                        <h3>Friends</h3>
                        <BsPeopleFill className='card_icon'/>
                    </div>
                    <h1>5</h1> 
                </div>

                <div className='card'>
                    <div className='card-inner'>
                        <h3>Messages</h3>
                        <BsFillBellFill className='card_icon'/>
                    </div>
                    <h1>2</h1> 
                </div>
            </div>

            {/* Motivation Box */}
            <div className="motivation-box">
                ⭐ You solved 79 exercises this week! Keep going! ⭐
            </div>

            {/* Charts Section */}
            <div className='charts'>

                <div className="chart-container">
                    <h4>Exercises vs Mistakes</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar 
                                dataKey="Ex" 
                                fill="#66bb6a"
                                radius={[10, 10, 0, 0]}
                                name="Exercises Solved"
                            />
                            <Bar 
                                dataKey="Erreur" 
                                fill="#ff8a65"
                                radius={[10, 10, 0, 0]}
                                name="Mistakes"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h4>Progress Over Time</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="Ex" 
                                stroke="#66bb6a"
                                strokeWidth={3}
                                dot={{ r: 6 }}
                                name="Exercises Solved"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="Erreur" 
                                stroke="#ff8a65"
                                strokeWidth={3}
                                dot={{ r: 6 }}
                                name="Mistakes"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </main>
    )
}

export default Home;