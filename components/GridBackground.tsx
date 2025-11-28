import React from 'react';

export const GridBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(212, 249, 50, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(212, 249, 50, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }}
            />
            {/* Gradient Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4F932]/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#D4F932]/15 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-[#D4F932]/5 rounded-full blur-[100px] animate-pulse-slow delay-2000" />
        </div>
    );
};
