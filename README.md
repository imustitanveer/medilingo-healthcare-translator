# MediLingo

MediLingo is a multilingual healthcare translation application designed to facilitate real-time communication between patients and healthcare providers. It provides seamless language translation during medical consultations, enabling doctors and patients to communicate effectively in various languages.

## Features

- **Real-time Speech-to-Text Conversion**: Converts speech from the patient and doctor into text for easy reading.
- **Instant Translation**: Translates text into the selected languages for both the doctor and patient.
- **Multilingual Support**: Supports a wide range of languages, making it easier for patients and doctors to communicate across language barriers.
- **Speech Playback**: Allows translated text to be spoken aloud in the appropriate language, assisting both doctors and patients.
- **Mobile-First Design**: Optimized for mobile devices, ensuring ease of use on smartphones and tablets.

## Installation

To install and run MediLingo locally, follow these steps:

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (Node Package Manager)

### Steps to Install

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/medilingo.git
   ```

2. Navigate into the project directory:

   ```bash
   cd medilingo
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and go to [http://localhost:5173](http://localhost:5173) to view the application.

## Usage

1. **Select the Languages**: Choose the language for both the patient and doctor from the dropdown menu.
2. **Speak**: Press the microphone button to start speech recognition for the patient or doctor. The spoken words will be converted to text.
3. **Translation**: Once the patient or doctor speaks, the text is automatically translated into the selected language and displayed in the text area.
4. **Speak Translated Text**: Press the **Speak** button below the text areas to hear the translated text in the selected language.

## Technologies Used

- **React**: Front-end framework for building the user interface.
- **TypeScript**: For static typing and enhancing code quality.
- **Vite**: Development server and build tool for faster bundling and hot reloading.
- **Web Speech API**: To convert speech to text and synthesize speech.
- **OpenAI GPT-3.5 Turbo API**: For language translation between different languages.

## Contribution

We welcome contributions to **MediLingo**! If you’d like to help improve the project, feel free to fork the repository and submit a pull request.

### Steps to Contribute

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to your branch (`git push origin feature/your-feature`).
6. Open a pull request with a description of the changes you made.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.