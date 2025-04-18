import confetti from "canvas-confetti";

 const fireConfetti = () => {
  console.log("fireConfetti function called");
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
};

export { fireConfetti }; 
