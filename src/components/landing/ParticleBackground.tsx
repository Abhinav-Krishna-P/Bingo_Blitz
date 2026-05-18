import { useEffect, useRef } from "react";

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 96 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.8 + 0.6,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      color: Math.random() > 0.72 ? "rgba(179,0,27,0.6)" : "rgba(42,31,21,0.18)",
    }));

    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      context.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle, index) => {
        particle.x = (particle.x + particle.speedX + canvas.width) % canvas.width;
        particle.y = (particle.y + particle.speedY + canvas.height) % canvas.height;

        context.fillStyle = particle.color;
        context.beginPath();
        if (index % 19 === 0) {
          context.font = "12px Fraunces";
          context.fillText("B", particle.x, particle.y);
        } else if (index % 23 === 0) {
          context.font = "12px Fraunces";
          context.fillText("O", particle.x, particle.y);
        } else {
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fill();
        }
      });
    };

    render();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-90" />;
}
