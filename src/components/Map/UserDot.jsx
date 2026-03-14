export default function UserDot() {
  return (
    <div className="relative">
      {/* Outer pulse ring */}
      <div
        className="absolute -inset-3 rounded-full bg-blue-400/20"
        style={{ animation: "pulse-ring 3s ease-out infinite" }}
      />
      {/* Inner dot */}
      <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-white shadow-lg shadow-blue-400/40" />
    </div>
  );
}
