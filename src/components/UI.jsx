import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Custom hook for typing effect
const useTypingEffect = (text, speed) => {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);
    return displayedText;
};

const ChatBot = () => {
    const [textToCopy, setTextToCopy] = useState("");
    const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });
    const [chatHistory, setChatHistory] = useState([]); // Store all chat messages
    const [loading, setLoading] = useState(false);
    const [intentType, setIntentType] = useState(null);
    const [question, setQuestion] = useState(""); // State to store the question
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    
    const { transcript, browserSupportsSpeechRecognition, listening } = useSpeechRecognition();

    useEffect(() => {
        if (transcript !== undefined) {
            console.log("Transcript:", transcript);
            setTextToCopy(transcript);
        }
    }, [transcript]);

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
            handleStopListening();
        } else {
            SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        }
    };

    const handleStopListening = async () => {
        setLoading(true);
        setIntentType(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not logged in. Please log in first.');
                window.location.href = '/login';
                return;
            }

            // Append user's transcript to chat history
            setChatHistory(prev => [...prev, { sender: 'user', message: transcript }]);

            // Detect intent from the transcript
            const detectIntentResponse = await axios.post(
                'http://127.0.0.1:8000/user_chats/detect_intent/',
                { message: transcript },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            const intent = detectIntentResponse.data.intent_number;
            setIntentType(intent);
            console.log(`Detected intent: ${intent}`);
            
            if (!intent) {
                throw new Error("No intent detected from the response");
            }

            // Handle different intents
            if (intent === 2) {
                const imageResponse = await axios.post(
                    'http://127.0.0.1:8000/user_chats/chat/',
                    { transcript },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
                if (imageResponse.data.image_path) {
                    const fullImageUrl = `http://127.0.0.1:8000${imageResponse.data.image_path}`;
                    setChatHistory(prev => [...prev, { sender: 'bot', message: fullImageUrl, type: 'image' }]);
                }
            } else if (intent === 4) {
                const webSearchResponse = await axios.post(
                    'http://127.0.0.1:8000/user_chats/scrap/',
                    { transcript },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
                setChatHistory(prev => [...prev, { sender: 'bot', message: webSearchResponse.data.response }]);
            } else if (intent === 1) {
                await captureImage(transcript, token);
            }
        } catch (error) {
            console.error("Error handling user input:", error);
            if (error.response && error.response.status === 401) {
                alert('Unauthorized: Please log in again.');
                window.location.href = '/login';
            } else {
                alert('An error occurred. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const captureImage = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.play();

            setTimeout(() => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                canvas.width = 640;
                canvas.height = 480;
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');

                const imageBlob = dataURLToBlob(dataUrl);
                stream.getTracks().forEach(track => track.stop());

                promptQuestion(imageBlob);
            }, 2000);
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert('Could not access camera. Please try again.');
        }
    };

    const promptQuestion = (imageBlob) => {
        const userQuestion = window.prompt("Please enter your question:");
        if (userQuestion) {
            setQuestion(userQuestion);
            handleApiCall(userQuestion, imageBlob);
        }
    };

    const handleApiCall = async (userQuestion, imageBlob) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image_data', imageBlob, 'captured_image.jpeg');
            formData.append('question', userQuestion);

            const response = await axios.post(
                'http://127.0.0.1:8000/user_chats/capture-image/',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            setChatHistory(prev => [...prev, { sender: 'bot', message: response.data.response }]);
        } catch (error) {
            console.error("Error during API call:", error);
            alert('An error occurred during API call. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const dataURLToBlob = (dataUrl) => {
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    // Render the chat history
    const renderChatHistory = () => {
        return chatHistory.map((chat, index) => (
            <div key={index} className={`chat-bubble ${chat.sender === 'user' ? 'user' : 'bot'}`}>
                {chat.type === 'image' ? (
                    <img src={chat.message} alt="Captured" className="rounded-lg" />
                ) : (
                    <p>{chat.message}</p>
                )}
            </div>
        ));
    };

    const typedWebSearchResult = useTypingEffect(webSearchResult, 50);
    const typedResponseText = useTypingEffect(responseText, 50);

    if (!browserSupportsSpeechRecognition) {
        return <p className="text-white">Your browser doesn't support speech recognition.</p>;
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-black">
            <div className="main-content p-6 bg-[#282936] rounded-lg shadow-lg min-h-[400px] w-full min-w-[800px] max-w-3xl mb-8 relative">
                <div className="chat-container">
                    {renderChatHistory()}
                </div>
                {loading && <p className="text-teal-500">Loading...</p>}
            </div>

            <div className="flex justify-center gap-7 py-7">
                <button className="bg-teal-500 text-white py-3 px-6 rounded-md hover:bg-teal-600 shadow-md" onClick={setCopied}>
                    {isCopied ? 'Copied!' : 'Copy to clipboard'}
                </button>
                <button className="bg-teal-500 text-white py-3 px-6 rounded-md hover:bg-teal-600 shadow-md" onClick={toggleListening}>
                    {listening ? 'Stop Listening' : 'Start Listening'}
                </button>
            </div>

            <video ref={videoRef} style={{ display: 'none' }}></video> {/* Hidden video element */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas> {/* Hidden canvas element */}
        </div>
    );
};

export default ChatBot;
