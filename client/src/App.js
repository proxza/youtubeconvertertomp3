import React, { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const downloadAudio = async () => {
    if (!url) {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/download?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error("Failed to retrieve video information");
      }
      const data = await response.json();
      const { title, path } = data;
      const fileResponse = await fetch(`/download-file?path=${encodeURIComponent(path)}&title=${encodeURIComponent(title)}`);
      if (!fileResponse.ok) {
        throw new Error("Failed to download file");
      }
      const blob = await fileResponse.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = title;
      link.click();
      setUrl(""); // Очистка поля ввода
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to download audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube to MP3 Converter</h1>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter YouTube URL" />
        <button onClick={downloadAudio} disabled={loading}>
          {loading ? "Downloading..." : "Download"}
        </button>
      </header>
    </div>
  );
}

export default App;
