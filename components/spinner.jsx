// Spinner.js
import React from 'react';

const Spinner = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-blue-500 border-solid rounded-full border-t-transparent animate-spin"></div>
        </div>
    );
};

export default Spinner; // Ensure you are using default export
