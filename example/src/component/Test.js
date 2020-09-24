import React, { useState, useEffect } from "react";

const Test = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    console.log("calling this once");
  }, []);

  return (
    <div style={{ backgroundColor: "white" }}>
      my count: {count}
      <button onClick={handleClick}>increment</button>
    </div>
  );
};

export default Test;
