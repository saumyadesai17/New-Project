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
    const [imagePath, setImagePath] = useState(null);
    const [loading, setLoading] = useState(false);
    const [intentType, setIntentType] = useState(null);
    const [webSearchResult, setWebSearchResult] = useState('');
    const [responseText, setResponseText] = useState('');  // Store the response text for typing effect
    const [question, setQuestion] = useState(""); // State to store the question
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    
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
            console.log("Transcript:", transcript);
            setTextToCopy(transcript);
        }
    }, [transcript]);

    const handleStopListening = async () => {
        setLoading(true);
        setIntentType(null);
        setWebSearchResult('');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not logged in. Please log in first.');
                window.location.href = '/login';
                return;
            }
    
            // Detect intent from the transcript
            console.log("Detecting intent...");
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
                console.log("Handling image generation intent...");
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
                    setImagePath(fullImageUrl);
                } else {
                    console.error("No image_path returned from API");
                }
            } else if (intent === 4) {
                console.log("Handling web search intent...");
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
    
                console.log('Web Search Response:', webSearchResponse.data);
                setWebSearchResult(webSearchResponse.data.response);
            } else if (intent === 1) {
                console.log("Handling image capture intent...");
                await captureImage(transcript, token);
            }
            
        } catch (error) {
            console.error("Error handling user input:", error);  // Detailed error log
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
    
    const captureImage = async () => {
        console.log("Attempting to capture image...");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
    
            // Allow the camera to initialize for a moment
            videoRef.current.play();
            setTimeout(() => {
                console.log("Capturing image...");
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                canvas.width = 640;  // Set desired width
                canvas.height = 480; // Set desired height
    
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
    
                // Log captured image data URL
                console.log("Captured Image Data URL:", dataUrl);
    
                // Convert dataURL to Blob
                const imageBlob = dataURLToBlob(dataUrl);
                setImagePath(dataUrl);
                stream.getTracks().forEach(track => track.stop()); // Stop the stream
                console.log("Video stream stopped.");
                promptQuestion(imageBlob); // Pass the Blob to the promptQuestion
            }, 2000); // Wait for 2 seconds before capturing (you can adjust this duration)
    
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert('Could not access camera. Please try again.');
        }
    };
    
    const promptQuestion = (imageBlob) => {
        console.log("Prompting user for question...");
        const userQuestion = window.prompt("Please enter your question:");
        if (userQuestion) {
            console.log("User question:", userQuestion);
            setQuestion(userQuestion);
            handleApiCall(userQuestion, imageBlob); // Pass the Blob to handleApiCall
        } else {
            console.log("No question entered.");
        }
    };
    

    const handleApiCall = async (userQuestion, imageBlob) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
    
            // Append image blob directly
            formData.append('image_data', imageBlob, 'captured_image.jpeg');
            formData.append('question', userQuestion);
    
            console.log("Sending API request with image and question...");
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
            console.log("Response:", response.data);
            setResponseText(response.data.response);
            console.log('Response from API:', response.data.response);
        } catch (error) {
            console.error("Error during API call:", error);
            alert('An error occurred during API call. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    
    

    // Use the typing effect hook with a 50ms delay
    const typedWebSearchResult = useTypingEffect(webSearchResult, 50);
    const typedResponseText = useTypingEffect(responseText, 50);  // Typing effect for response text

    if (!browserSupportsSpeechRecognition) {
        return <p className="text-white">Your browser doesn't support speech recognition.</p>;
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-black">  
            <div className="main-content p-6 bg-[#282936] rounded-lg shadow-lg min-h-[400px] w-full min-w-[800px] max-w-3xl mb-8 relative">
                {!transcript && !listening && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-400 text-2xl">Say something...</p>
                    </div>
                )}
                <div className="relative z-10 text-white text-2xl">
                    {transcript || ''}
                </div>
                
                {loading && intentType === 2 && (
                    <p className="text-teal-500">Generating image...</p>
                )}
                {loading && intentType === 4 && (
                    <p className="text-teal-500">Performing web search...</p>
                )}

                {imagePath && (
                    <div className="mt-4">
                        <img src={imagePath} alt="Captured" className="rounded-lg" />
                    </div>
                )}

                {webSearchResult && (
                    <div className="mt-4 text-white text-lg">
                        <p>Web Search Result:</p>
                        <p>{typedWebSearchResult}</p>
                    </div>
                )}

                {/* Display response text with typing effect */}
                {responseText && (
                    <div className="mt-4 text-white text-lg">
                        <p>Response:</p>
                        <p>{typedResponseText}</p>  {/* Apply typing effect here */}
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
            <video ref={videoRef} style={{ display: 'none' }}></video> {/* Hidden video element */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas> {/* Hidden canvas element */}
        </div>
    );
};

export default ChatBot;
