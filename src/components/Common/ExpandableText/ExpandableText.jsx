import { useState, useRef, useEffect } from 'react';
import styles from './ExpandableText.module.css';

export default function ExpandableText({ text, lines = 3, className = '' }) {
    const [expanded, setExpanded] = useState(false);
    const [isClamped, setIsClamped] = useState(false);
    const textRef = useRef(null);

    useEffect(() => {
        const el = textRef.current;
        if (!el) return;
        el.style.webkitLineClamp = lines;
        const clamped = el.scrollHeight > el.clientHeight;
        setIsClamped(clamped);
    }, [text, lines]);

    return (
        <div className={styles.wrapper}>
            <p
                ref={textRef}
                className={`${styles.text} ${className}`}
                style={{
                    WebkitLineClamp: expanded ? 'unset' : lines,
                }}
            >
                {text}
            </p>

            {(isClamped || expanded) && (
                <button
                    className={styles.toggle}
                    onClick={() => setExpanded(prev => !prev)}
                >
                    {expanded ? (
                       'Thu gọn'
                    ) : (
                         'Xem thêm'
                    )}
                </button>
            )}
        </div>
    );
}