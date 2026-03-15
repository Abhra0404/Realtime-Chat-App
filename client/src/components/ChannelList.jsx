import { useState } from "react";

export default function ChannelList({ rooms, activeRoomId, onSelectRoom, onCreateRoom }) {
  const [name, setName] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    onCreateRoom(name.trim());
    setName("");
  };

  return (
    <section className="h-full rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] p-4 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wider text-[var(--text-subtle)]">CHANNELS</h2>
      </div>

      <form onSubmit={submit} className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New room"
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-panel-strong)] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-slate-950"
        >
          +
        </button>
      </form>

      <div className="space-y-2">
        {rooms.map((room) => {
          const active = room._id === activeRoomId;
          return (
            <button
              key={room._id}
              type="button"
              onClick={() => onSelectRoom(room)}
              className={`w-full rounded-xl px-3 py-2 text-left transition ${
                active
                  ? "bg-[var(--accent)] text-slate-950"
                  : "border border-[var(--line)] bg-[var(--bg-panel-strong)] hover:border-[var(--accent)]"
              }`}
            >
              # {room.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
