import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import { useState, useEffect } from "react";

const ChatBot = () => {
    const [textToCopy, setTextToCopy] = useState("");
    const [isCopied, setCopied] = useClipboard(textToCopy, {
        successDuration: 1000
    });

    const toggleListening = () => {
      if (listening) {
          SpeechRecognition.stopListening();
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

    if (!browserSupportsSpeechRecognition) {
        return <p className="text-white">Your browser doesn't support speech recognition.</p>;
    }

    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black">  
        <div className="main-content p-6 bg-[#282936] rounded-lg shadow-lg min-h-[400px] w-full min-w-[800px] max-w-3xl mb-8 relative">
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${listening || transcript ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-gray-400 text-2xl">Say something...</p>
            </div>
            <div className="relative z-10 text-white text-2xl">
                {transcript}
            </div>
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