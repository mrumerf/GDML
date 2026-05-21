import { useState, useEffect } from "react";
import useStore from "../../store";

const Notification = () => {
    const [visible, setVisible] = useState(false);

    //store vars
    const message = useStore(s => s.notify)
    const notifyTimer = useStore(s => s.notifyTimer)

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => { setVisible(false); alert(''); }, notifyTimer || 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!visible) return null;

    return (
        message && <div style={styles.notification}>
            <strong>Genius Digger says:</strong><br /><br /> {message}
        </div>
    );
};

const styles = {
    notification: {
        position: "fixed",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#333",
        color: "#fff",
        padding: "15px 25px",
        borderRadius: "8px",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        transition: "opacity 0.3s ease-in-out",
        fontSize: "16px",
        fontWeight: "400",
        textAlign: "left",
        maxWidth: "80%",
        zIndex: 1000,
        maxWidth: "30%",
        whiteSpace: 'pre-line',
        fontFamily: "Arial, sans-serif",
    },
};

export default Notification;
