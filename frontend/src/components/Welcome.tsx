import React from "react";

const Welcome: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome!</h1>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center" as const,
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    height: "100vh",
  },
  heading: {
    fontSize: "10.5em",
    color: "#333",
  },
};

export default Welcome;
