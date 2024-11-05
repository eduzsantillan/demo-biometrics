import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowCamera(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedImage) {
      setMessage("Please capture an image");
      return;
    }

    try {
      const verifyResponse = await axios.post("http://127.0.0.1:80/verify", {
        image: capturedImage,
      });

      const responseBody = verifyResponse.data;

      if (responseBody.verified) {
        const response = await axios.post("http://127.0.0.1:80/login", {
          email,
          target: capturedImage,
        });
        if (response.data.verified) {
          navigate("/welcome");
        } else {
          setMessage(response.data.message || "Face verification failed");
        }
      } else {
        setMessage(responseBody.message || "Face verification failed");
      }
    } catch (error) {
      setMessage("Login failed. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-primary mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          Photo
        </label>
        {showCamera ? (
          <div className="relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-md"
            />
            <button
              type="button"
              onClick={captureImage}
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 btn btn-primary"
            >
              Capture
            </button>
          </div>
        ) : capturedImage ? (
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full rounded-md"
            />
            <button
              type="button"
              onClick={() => {
                setCapturedImage(null);
                setShowCamera(true);
              }}
              className="absolute top-2 right-2 p-1 bg-white rounded-full"
            >
              <X className="w-5 h-5 text-primary" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="w-full py-12 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-600 hover:border-gray-400 transition-colors duration-300"
          >
            <Camera className="w-8 h-8 mb-2" />
            <span>Click to capture photo</span>
          </button>
        )}
      </div>
      <button type="submit" className="w-full btn btn-primary">
        Login
      </button>
      {message && (
        <p className="mt-4 text-sm text-center text-primary">{message}</p>
      )}
    </form>
  );
};

export default Login;
