"use client";
import { useState } from "react";


export default function Stage() {
    const [currentText, setCurrentText] = useState('Following along...');

    return (
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-lg">
            <p className="text-4xl font-bold text-white text-center leading-relaxed">
              {currentText}
            </p>
          </div>
    );
}