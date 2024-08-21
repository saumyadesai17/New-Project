import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import { useState, useEffect } from "react";
import axios from "axios";

const ChatBot = () => {
    const [textToCopy, setTextToCopy] = useState("");
    const [isCopied, setCopied] = useClipboard(textToCopy, {
        successDuration: 1000
    });
    const [imagePath, setImagePath] = useState(null);  // Store the image path
    const [loading, setLoading] = useState(false);  // Handle loading state

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
            handleStopListening();
        } else {
            SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        }
    };

    const { transcript, browserSupportsSpeechRecognition, listening } = useSpeechRecognition();

    useEffect(() => {
        if (transcript !== undefined) {
            setTextToCopy(transcript);
        }
    }, [transcript]);

    const handleStopListening = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not logged in. Please log in first.');
                window.location.href = '/login'; // Example redirect, adjust the path as needed
                return;
            }
    
            const response = await axios.post(
                'http://127.0.0.1:8000/user_chats/chat/',
                { transcript },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.image_path) {
                const imageURL = `http://127.0.0.1:8000/media/${response.data.image_path}`;
                setImagePath(imageURL);
            }
        } catch (error) {
            console.error("Error generating image:", error);
            if (error.response && error.response.status === 401) {
                alert('Unauthorized: Please log in again.');
                window.location.href = '/login'; // Example redirect, adjust the path as needed
            } else {
                alert('An error occurred. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    

    if (!browserSupportsSpeechRecognition) {
        return <p className="text-white">Your browser doesn't support speech recognition.</p>;
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-black">  
            <div className="main-content p-6 bg-[#282936] rounded-lg shadow-lg min-h-[400px] w-full min-w-[800px] max-w-3xl mb-8 relative">
                {/* "Say something..." text disappears when the user starts speaking */}
                {!transcript && !listening && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-400 text-2xl">Say something...</p>
                    </div>
                )}
                {/* Display transcript */}
                <div className="relative z-10 text-white text-2xl">
                    {transcript || ''}
                </div>
                {/* Display loading state */}
                {loading && <p className="text-teal-500">Generating image...</p>}
                {/* Display generated image */}
                {imagePath && (
                    <div className="mt-4">
                        <img src={imagePath} alt="Generated" className="rounded-lg" />
                    </div>
                )}
            </div>
            <div className="flex justify-center gap-7 py-7">
                <button className="bg-teal-500 text-white py-3 px-6 rounded-md hover:bg-teal-600 shadow-md" onClick={setCopied}>
                    {isCopied ? 'Copied!' : 'Copy to clipboard'}
                </button>
                <button 
                    className={`bg-teal-500 text-white py-3 px-6 rounded-md hover:bg-teal-600 shadow-md`} 
                    onClick={toggleListening}
                >
                    {listening ? 'Stop Listening' : 'Start Listening'}
                </button>
            </div> 
        </div>
    );
};

export default ChatBot;
