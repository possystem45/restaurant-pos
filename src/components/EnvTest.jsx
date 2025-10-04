import React from 'react';

const EnvTest = () => {
    const password = import.meta.env.VITE_MANAGER_PASSWORD;
    

    
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, background: 'red', color: 'white', padding: '10px', zIndex: 9999 }}>
            <p>Password: {password || 'NOT FOUND'}</p>
            <p>Node env: {import.meta.env.VITE_NODE_ENV}</p>
        </div>
    );
};

export default EnvTest;
