import Register from "../components/Register";
import Login from "../components/Login";
import { useState } from "react";
import { Camera } from "lucide-react";

const Main = () => {
  const [isRegistering, setIsRegistering] = useState(true);

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Camera className="inline-block w-12 h-12 text-primary" />
          <h1 className="text-3xl font-bold mt-2 text-primary">
            {isRegistering ? "Register" : "Login"}
          </h1>
        </div>
        {isRegistering ? <Register /> : <Login />}
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-4 text-sm text-primary hover:underline"
        >
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};

export default Main;
