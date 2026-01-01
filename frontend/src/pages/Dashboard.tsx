import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useStreamStore } from "../store/streamStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import Chat from "../components/Chat";
import { Play, Mic, StopCircle, Radio, LogOut } from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const {
    streams,
    fetchStreams,
    createStream,
    startStream,
    stopStream,
    setActiveStream,
  } = useStreamStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStreamTitle, setNewStreamTitle] = useState("");
  const [newStreamGenre, setNewStreamGenre] = useState("");

  // Local state to view a specific stream's chat even if not playing audio
  // But typically chat is tied to playback. Let's tie it to the "View" action.
  const [viewingStreamId, setViewingStreamId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 10000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamTitle) return;
    await createStream({
      title: newStreamTitle,
      genre: newStreamGenre,
    });
    setShowCreateModal(false);
    setNewStreamTitle("");
    setNewStreamGenre("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar / Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 mr-0">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">OnAir</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-400">
              Welcome, {user?.username}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-gray-700 hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold">Live Channels</h2>
            <Button onClick={() => setShowCreateModal(!showCreateModal)}>
              <Mic className="w-4 h-4 mr-2" />
              Start Broadcast
            </Button>
          </div>

          {/* Create Stream Modal (Inline for MVP) */}
          {showCreateModal && (
            <div className="mb-8 p-6 bg-gray-900 rounded-xl border border-gray-800 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-lg font-medium mb-4">New Broadcast Setup</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">
                    Stream Title
                  </label>
                  <Input
                    value={newStreamTitle}
                    onChange={(e) => setNewStreamTitle(e.target.value)}
                    placeholder="Late Night Jazz..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">
                    Genre
                  </label>
                  <Input
                    value={newStreamGenre}
                    onChange={(e) => setNewStreamGenre(e.target.value)}
                    placeholder="Jazz, Pop, Rock, etc..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Go Live</Button>
                </div>
              </form>
            </div>
          )}

          {/* Stream Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className={cn(
                  "group relative bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all hover:shadow-2xl",
                  viewingStreamId === stream.id ? "ring-2 ring-blue-500" : ""
                )}
              >
                {/* Stream Cover / Visuals */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <Radio className="w-12 h-12 text-gray-700" />

                  {stream.isActive ? (
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm animate-pulse">
                        LIVE
                      </span>
                      <span className="bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {stream.type}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        OFFLINE
                      </span>
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setActiveStream(stream);
                        setViewingStreamId(stream.id);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Listen
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => setViewingStreamId(stream.id)}
                    >
                      Chat Only
                    </Button>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">
                    {stream.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    DJ: {stream.user.username}
                  </p>

                  {/* Control for Owner */}
                  {user?.id === stream.user.id && (
                    <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                      <span className="text-xs text-blue-400 font-medium">
                        Your Stream
                      </span>
                      {stream.isActive ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => stopStream(stream.id)}
                          className="h-7 text-xs"
                        >
                          <StopCircle className="w-3 h-3 mr-1" />
                          End
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => startStream(stream.id)}
                          className="h-7 text-xs bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {streams.length === 0 && !streams.length && (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                <Radio className="w-12 h-12 mb-4 opacity-20" />
                <p>No streams live right now.</p>
                <p className="text-sm">Be the first to start broadcasting!</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Right Sidebar: Chat */}
      {viewingStreamId && (
        <div className="w-80 h-full border-l border-gray-800 bg-gray-900 shadow-2xl z-40 transition-all">
          <div className="h-full flex flex-col">
            <div className="p-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => setViewingStreamId(null)}
              >
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Chat streamId={viewingStreamId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
