export default function AtmosphereBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-20 overflow-hidden"
      style={{ backgroundColor: "rgb(251 250 249)" }}
    >
      <div className="atmos-field atmos-1" />
      <div className="atmos-field atmos-2" />
      <div className="atmos-field atmos-3" />
      <div className="atmos-field atmos-4" />
      <div className="atmos-field atmos-5" />
    </div>
  );
}
