import React from 'react';

const Loading = () => {
    return (
        <>
            <style>
                {`
                    .loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255, 255, 255, 0.95);
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        z-index: 9999;
                    }

                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 24px;
                    }

                    .polygon-spinner {
                        width: 80px;
                        height: 80px;
                        position: relative;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .polygon-shape {
                        width: 60px;
                        height: 60px;
                        background: oklch(62.3% 0.214 259.815);
                        animation: morph 2s infinite;
                        clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
                    }

                    .loading-text {
                        font-size: 18px;
                        font-weight: 600;
                        color: oklch(62.3% 0.214 259.815);
                        animation: pulse 1.5s ease-in-out infinite;
                    }

                    .loading-dots {
                        display: flex;
                        gap: 8px;
                    }

                    .dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: oklch(62.3% 0.214 259.815);
                        animation: bounce 1.4s ease-in-out infinite;
                    }

                    .dot:nth-child(2) {
                        animation-delay: 0.2s;
                        background: oklch(72.3% 0.18 259.815);
                    }

                    .dot:nth-child(3) {
                        animation-delay: 0.4s;
                        background: oklch(82.3% 0.14 259.815);
                    }

                    @keyframes morph {
                        0% {
                            clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
                            transform: rotate(0deg);
                        }
                        25% {
                            clip-path: polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%);
                            transform: rotate(90deg);
                        }
                        50% {
                            clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
                            transform: rotate(180deg);
                        }
                        75% {
                            clip-path: polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%);
                            transform: rotate(270deg);
                        }
                        100% {
                            clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.6;
                        }
                    }

                    @keyframes bounce {
                        0%, 80%, 100% {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-12px);
                        }
                    }
                `}
            </style>
            <div className="loading-overlay">
                <div className="loading-container">
                    <div className="polygon-spinner">
                        <div className="polygon-shape"></div>
                    </div>
                    <div className="loading-text">콘텐츠를 불러오는 중</div>
                    <div className="loading-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Loading;

