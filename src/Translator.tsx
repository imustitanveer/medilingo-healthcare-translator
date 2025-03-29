import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { Textarea } from "@/components/ui/textarea";
  import { MdArrowDropDown } from "react-icons/md";
  import { MdMicNone } from "react-icons/md";
  import { useState } from "react";
  import './App.css';
  import axios from "axios";
  import TranscriptView from "./TranscriptView";
  import { MdVolumeUp } from "react-icons/md";
  import { handleSpeakText } from './TranscriptView';
  
// Define the Language type
interface Language {
    code: string;
    label: string;
  }
  
  const Translator: React.FC = () => {
    const [patientLanguage, setPatientLanguage] = useState<string>('en-US');
    const [doctorLanguage, setDoctorLanguage] = useState<string>('en-US');
    const [patientText, setPatientText] = useState<string>('');
    const [doctorText, setDoctorText] = useState<string>('');
    const [translatedPatientText, setTranslatedPatientText] = useState<string>('');
    const [translatedDoctorText, setTranslatedDoctorText] = useState<string>('');
    const [isListeningPatient, setIsListeningPatient] = useState<boolean>(false);
    const [isListeningDoctor, setIsListeningDoctor] = useState<boolean>(false);
  
    // Conversation history to store the patient and doctor conversation
    const [conversations, setConversations] = useState<any[]>([]);
  
    // List of top 10 spoken languages supported by Web Speech API
    const languages: Language[] = [
      { code: 'en-US', label: 'English (US)' },
      { code: 'es-ES', label: 'Spanish' },
      { code: 'hi-IN', label: 'Hindi' },
      { code: 'ar-SA', label: 'Arabic' },
      { code: 'bn-BD', label: 'Bengali' },
      { code: 'pt-PT', label: 'Portuguese' },
      { code: 'ru-RU', label: 'Russian' },
      { code: 'ja-JP', label: 'Japanese' },
      { code: 'zh-CN', label: 'Chinese (Mandarin)' },
      { code: 'fr-FR', label: 'French' }
    ];
  
    // GPT-3.5 Turbo API function to translate text
    const gpt3Turbo = async (text: string, targetLanguage: string) => {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
      const prompt = `Translate the following text into ${targetLanguage}: ${text}`;
  
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 150,
            temperature: 0.7,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        const translatedText = response.data.choices[0].message.content.trim();
        return translatedText;
      } catch (error) {
        console.error("Error with GPT-3.5 API:", error);
        throw error;
      }
    };
  
    // Initialize SpeechRecognition for patient and doctor
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error("SpeechRecognition API is not supported in this browser");
  }

  const recognitionPatient = new SpeechRecognition();
  recognitionPatient.continuous = false;  // Set to false to stop after one sentence
  recognitionPatient.interimResults = false;  // Only use final results
  recognitionPatient.lang = patientLanguage;

  const recognitionDoctor = new SpeechRecognition();
  recognitionDoctor.continuous = false;  // Set to false to stop after one sentence
  recognitionDoctor.interimResults = false;  // Only use final results
  recognitionDoctor.lang = doctorLanguage;

  const handleMicClick = (speaker: 'patient' | 'doctor') => {
    if (speaker === 'patient') {
      if (isListeningPatient) {
        recognitionPatient.stop();
        setIsListeningPatient(false);
      } else {
        recognitionPatient.start();
        setIsListeningPatient(true);
      }
  
      recognitionPatient.onresult = async (event: any) => {
        const transcript = event.results[event.resultIndex][0].transcript;
        setPatientText(transcript); // Display the original text
  
        // Translate patient's text into doctor's language
        try {
          const translatedText = await gpt3Turbo(transcript, doctorLanguage); // Translate to doctor's language
          setTranslatedPatientText(translatedText);
  
          // Replace the patient text area with the translated text
          setPatientText(translatedText);  // Set translated text in the textarea
  
          // Add both the original and translated text to the conversation history in one update
          setConversations((prevConversations) => [
            ...prevConversations, // Add new entry at the bottom (last)
            { 
              speaker: 'Patient', 
              original: transcript, 
              translated: translatedText 
            },
          ]);
        } catch (error) {
          console.error("Translation error:", error);
        }
  
        setIsListeningPatient(false); // Stop glowing mic
      };
  
      recognitionPatient.onerror = (event: any) => {
        console.error("Error occurred in recognition: " + event.error);
      };
  
      recognitionPatient.onend = () => {
        setIsListeningPatient(false); // Ensure mic stops glowing after recognition ends
      };
    } else if (speaker === 'doctor') {
      if (isListeningDoctor) {
        recognitionDoctor.stop();
        setIsListeningDoctor(false);
      } else {
        recognitionDoctor.start();
        setIsListeningDoctor(true);
      }
  
      recognitionDoctor.onresult = async (event: any) => {
        const transcript = event.results[event.resultIndex][0].transcript;
        setDoctorText(transcript); // Display the original text
  
        // Translate doctor's text into patient's language
        try {
          const translatedText = await gpt3Turbo(transcript, patientLanguage); // Translate to patient's language
          setTranslatedDoctorText(translatedText);
  
          // Replace the doctor text area with the translated text
          setDoctorText(translatedText);  // Set translated text in the textarea
  
          // Add both the original and translated text to the conversation history in one update
          setConversations((prevConversations) => [
            ...prevConversations, // Add new entry at the bottom (last)
            { 
              speaker: 'Doctor', 
              original: transcript, 
              translated: translatedText 
            },
          ]);
        } catch (error) {
          console.error("Translation error:", error);
        }
  
        setIsListeningDoctor(false); // Stop glowing mic
      };
  
      recognitionDoctor.onerror = (event: any) => {
        console.error("Error occurred in recognition: " + event.error);
      };
  
      recognitionDoctor.onend = () => {
        setIsListeningDoctor(false); // Ensure mic stops glowing after recognition ends
      };
    }
  };  
  

  const handlePatientLanguageChange = (langCode: string) => {
    setPatientLanguage(langCode);
  };

  const handleDoctorLanguageChange = (langCode: string) => {
    setDoctorLanguage(langCode);
  };
  
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-slate-800 p-4">
            {/* patient title */}
            <div className="flex flex-row items-center gap-2">
            <svg
            height="200px"
            width="200px"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 392.614 392.614"
            xmlSpace="preserve"
            fill="#000000"
            className="w-10 h-10"
            >
            <g id="SVGRepo_iconCarrier">
                <g>
                <polygon fill="#FFC10D" points="83.232,82.046 26.408,138.935 55.434,168.026 83.232,140.163" />
                <polygon fill="#FFC10D" points="309.366,140.163 337.164,168.026 366.19,138.935 309.366,82.046" />
                </g>
                <path
                fill="#FFFFFF"
                d="M196.299,111.525c-27.022,0-49.584-19.329-54.691-44.8h-36.525v259.168H287.58V66.66h-36.655
                C245.818,92.195,223.257,111.525,196.299,111.525z"
                />
                <path
                fill="#56ACE0"
                d="M196.299,133.311c-30.384,0-56.695-17.519-69.495-42.99v144.097h35.943
                c6.012,0,10.925,4.848,10.925,10.925c0,6.012-4.848,10.925-10.925,10.925h-35.943v21.786h18.036c6.012,0,10.925,4.849,10.925,10.925
                s-4.848,10.925-10.925,10.925h-18.036v4.202h138.861V90.191C252.994,115.727,226.683,133.311,196.299,133.311z"
                />
                <g>
                <path
                    fill="#194F82"
                    d="M389.398,131.242l-83.2-83.2c-2.133-2.133-5.042-3.232-7.887-3.168h-57.212
                    c-6.012,0-10.925,4.848-10.925,10.925c0,18.683-15.192,33.939-33.939,33.939s-33.939-15.192-33.939-33.939
                    c0-6.012-4.848-10.925-10.925-10.925H94.158c-2.844,0-5.689,1.034-7.887,3.168L3.2,131.242c-4.267,4.267-4.267,11.119,0,15.451
                    l44.477,44.477c4.978,4.202,11.313,4.267,15.451,0l20.105-20.105v165.754c0,6.012,4.848,10.925,10.925,10.925H298.44
                    c6.012,0,10.925-4.848,10.925-10.925V170.999l20.17,20.17c4.202,4.267,10.408,4.396,15.451,0l44.541-44.541
                    C393.665,142.426,393.665,135.444,389.398,131.242z M26.408,138.935l56.889-56.889v58.117l-27.798,27.798L26.408,138.935z
                    M287.58,325.892H105.018V66.66h36.525c5.107,25.471,27.669,44.8,54.691,44.8c26.958,0,49.519-19.329,54.626-44.8h36.655v259.232
                    H287.58z M337.164,168.026l-27.798-27.798V82.111l56.889,56.889L337.164,168.026z"
                />
                <path
                    fill="#194F82"
                    d="M232.76,185.351h-25.6v-25.6c0-6.012-4.848-10.925-10.925-10.925
                    c-6.077,0-10.925,4.848-10.925,10.925v25.6h-25.6c-6.012,0-10.925,4.848-10.925,10.925c0,6.012,4.848,10.925,10.925,10.925h25.6
                    v25.6c0,6.012,4.848,10.925,10.925,10.925c6.012,0,10.925-4.848,10.925-10.925v-25.6h25.6c6.012,0,10.925-4.848,10.925-10.925
                    C243.685,190.264,238.772,185.351,232.76,185.351z"
                />
                </g>
            </g>
            </svg>
            <h1 className="text-2xl text-white font-bold">Patient</h1>
            </div>
            <div className="flex flex-row items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-white p-2 bg-slate-700 rounded-2xl my-2 px-4 flex flex-row items-center gap-2 hover:cursor-pointer hover:bg-slate-500">
                {languages.find((lang) => lang.code === patientLanguage)?.label || 'Select Language'}
                <MdArrowDropDown className="text-2xl pt-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.map((lang) => (
                  <DropdownMenuItem key={lang.code} onClick={() => handlePatientLanguageChange(lang.code)}>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <MdMicNone
              className={`text-4xl text-white bg-slate-600 p-2 rounded-full hover:cursor-pointer hover:bg-slate-500 ${isListeningPatient ? 'animate-pulse' : ''}`}
              onClick={() => handleMicClick('patient')}
            />
          </div>
          <Textarea
            className="bg-slate-200 h-30"
            value={patientText}  // Will show the translated text when set
            readOnly
            />
            {/* Speak Button for Patient's TextArea */}
            <button
            onClick={() => {
                handleSpeakText(patientText, doctorLanguage); // Speak the patient's original text in doctor's language
            }}
            className="flex items-center gap-2 text-blue-500 mt-2"
            >
            <MdVolumeUp className="text-xl" />
            <span>Speak</span>
            </button>
        </div>

            <div className="bg-slate-800 p-4">
            {/* doctor title */}
            <div className="flex flex-row items-center gap-2">
            <svg
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 460 460"
                xmlSpace="preserve"
                fill="#000000"
                className="w-10 h-10">
                <g id="XMLID_822_">
                    <path
                    id="XMLID_823_"
                    fill="#DA5B66"
                    d="M230,0C102.974,0,0,102.975,0,230c0,105.312,70.781,194.089,167.364,221.364 l284.152-283.437C424.427,71.057,335.516,0,230,0z"
                    />
                    <path
                    id="XMLID_824_"
                    fill="#BD0A13"
                    d="M460,230c0-21.509-2.962-42.326-8.484-62.073L399.589,116H80.411l-20,124 l119.181,119.181L130,414l37.364,37.364C187.278,456.987,208.287,460,230,460C357.026,460,460,357.025,460,230z"
                    />
                    <polygon id="XMLID_825_" fill="#82C8DB" points="171.159,46 230,46 240,79.212 230,112.425" />
                    <polygon id="XMLID_826_" fill="#419EBE" points="288.841,46 230,46 230,112.425" />
                    <polygon
                    id="XMLID_827_"
                    fill="#FFFFFF"
                    points="180,46 130,46 130,46.411 60.411,116 60.411,240 110.411,240 110.411,136.711 130,117.122 130,414 230,414 240,263.212 230,112.425"
                    />
                    <polygon
                    id="XMLID_828_"
                    fill="#A3DDE9"
                    points="330,46.411 330,46 278,46 230,112.425 230,414 330,414 330,117.122 349.589,136.711 349.589,240 399.589,240 399.589,116"
                    />
                    <rect id="XMLID_829_" x="270" y="260" width="60" height="70" fill="#62B3CD" />
                    <rect id="XMLID_830_" x="130" y="260" width="60" height="70" fill="#D1EEF4" />
                    <polygon
                    id="XMLID_831_"
                    fill="#D1EEF4"
                    points="161.159,46 186.884,30.564 230,102.425 240,160.287 230,218.15 161.159,104.286 186.873,88.856"
                    />
                    <polygon
                    id="XMLID_832_"
                    fill="#62B3CD"
                    points="298.841,46 273.116,30.564 230,102.425 230,218.15 298.841,104.286 273.127,88.856"
                    />
                </g>
            </svg>
            <h1 className="text-2xl text-white font-bold">Doctor</h1>
            </div>
            <div className="flex flex-row items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-white p-2 bg-slate-700 rounded-2xl my-2 px-4 flex flex-row items-center gap-2 hover:cursor-pointer hover:bg-slate-500">
                {languages.find((lang) => lang.code === doctorLanguage)?.label || 'Select Language'}
                <MdArrowDropDown className="text-2xl pt-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.map((lang) => (
                  <DropdownMenuItem key={lang.code} onClick={() => handleDoctorLanguageChange(lang.code)}>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <MdMicNone
              className={`text-4xl text-white bg-slate-600 p-2 rounded-full hover:cursor-pointer hover:bg-slate-500 ${isListeningDoctor ? 'animate-pulse' : ''}`}
              onClick={() => handleMicClick('doctor')}
            />
          </div>
          <Textarea
            className="bg-slate-200 h-30"
            value={doctorText}  // Will show the translated text when set
            readOnly
            />
            {/* Speak Button for Doctor's TextArea */}
            <button
            onClick={() => {
                handleSpeakText(doctorText, patientLanguage); // Speak the doctor's original text in patient's language
            }}
            className="flex items-center gap-2 text-blue-500 mt-2"
            >
            <MdVolumeUp className="text-xl" />
            <span>Speak</span>
            </button>
        </div>
      </div>
      {/* Pass the conversation history to TranscriptView */}
      <TranscriptView
        conversations={conversations}
        patientLanguage={patientLanguage}
        doctorLanguage={doctorLanguage}
        />
        </>
    );
  };
  
  export default Translator