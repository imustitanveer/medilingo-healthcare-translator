import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { MdVolumeUp } from "react-icons/md"; // Placeholder for Speak button
import './App.css';

interface Conversation {
  speaker: string;
  original: string;
  translated: string;
}

interface TranscriptProps {
  conversations: Conversation[];
  patientLanguage: string;  // Add patientLanguage
  doctorLanguage: string;   // Add doctorLanguage
}

export const handleSpeakText = (text: string, language: string) => {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = language; // Set the language dynamically
  window.speechSynthesis.speak(speech);
};

export default function TranscriptView({ conversations, patientLanguage, doctorLanguage }: TranscriptProps) {

  return (
    <>
      <div className="relative flex items-center my-4 px-4">
        <span className="w-full border-t border-gray-300"></span>
      </div>
      <h1 className="text-2xl font-bold text-white text-center pb-2">Transcript</h1>
      <div className="px-4">
        <Card className="w-full mx-auto px-4 bg-slate-200">
          <CardContent className="p-4">
            <ScrollArea className="h-80 p-2 border rounded-lg">
              {conversations.map((conversation, index) => (
                <div key={index} className="mb-4">
                  <h2 className="text-lg text-gray-800 font-semibold">{conversation.speaker}:</h2>
                  <div className="text-sm leading-relaxed">
                    <p><strong>Original:</strong> {conversation.original}</p>
                    <p><strong>Translated:</strong> {conversation.translated}</p>
                  </div>
                  <button
                    onClick={() => {
                      // Dynamically set language based on the speaker
                      if (conversation.speaker === 'Doctor') {
                        handleSpeakText(conversation.translated, patientLanguage); // Doctor speaks in patient's language
                      } else {
                        handleSpeakText(conversation.translated, doctorLanguage); // Patient speaks in doctor's language
                      }
                    }}
                    className="flex items-center gap-2 text-blue-500 mt-2 hover:cursor-pointer hover:text-blue-400"
                  >
                    <MdVolumeUp className="text-xl" />
                    <span>Speak</span>
                  </button>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}