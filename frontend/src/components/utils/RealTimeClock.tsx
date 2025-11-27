import { useState, useEffect } from 'react';

function RealTimeClock({ className = '' }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <p className={className}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
    );
}

export default RealTimeClock;
