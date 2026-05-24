export function TelepathBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#07070b]">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(60% 50% at 12% 8%, rgba(255, 85, 119, 0.30) 0%, transparent 60%), radial-gradient(55% 50% at 88% 10%, rgba(77, 142, 255, 0.32) 0%, transparent 62%), radial-gradient(70% 55% at 50% 110%, rgba(57, 217, 138, 0.26) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(7,7,11,0.6) 75%, rgba(7,7,11,0.9) 100%)",
        }}
      />
    </div>
  );
}
