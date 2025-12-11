import React, { useRef, useEffect } from "react";
import {
  Home,
  Users,
  Save,
  Calendar,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react";

export default function EditorView({
  currentNote,
  activeUsers,
  saveStatus,
  isConnected,
  setCurrentView,
  setCurrentNote,
  handleContentChange,
  handleTitleChange,
  formatDate,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [currentNote?.content]);

  if (!currentNote) return null;

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <Save className="w-4 h-4 animate-pulse" />;
      case "saved":
        return <CheckCircle className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return "Error saving";
      default:
        return "Editing...";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => {
                setCurrentView("home");
                setCurrentNote(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 
                       rounded-lg transition-all duration-200 backdrop-blur-sm
                       hover:scale-105 active:scale-95 w-fit"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg backdrop-blur-sm
                           ${
                             isConnected ? "bg-green-500/20" : "bg-red-500/20"
                           }`}
              >
                {isConnected ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isConnected ? "Connected" : "Offline"}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/20 px-3 sm:px-4 py-2 rounded-lg backdrop-blur-sm">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{activeUsers}</span>
                <span className="text-sm">
                  {activeUsers === 1 ? "user" : "users"}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/20 px-3 sm:px-4 py-2 rounded-lg backdrop-blur-sm">
                {getSaveStatusIcon()}
                <span className="text-sm font-medium">
                  {getSaveStatusText()}
                </span>
              </div>
            </div>
          </div>

          <input
            type="text"
            value={currentNote.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full bg-white/10 border-2 border-white/20 rounded-lg px-4 py-3
                     text-2xl sm:text-3xl lg:text-4xl font-bold text-white
                     placeholder-white/50 focus:outline-none focus:border-white/40
                     transition-all duration-200 backdrop-blur-sm"
            placeholder="Untitled Note"
            maxLength={200}
          />

          <p className="text-blue-100 text-xs sm:text-sm mt-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last updated: {formatDate(currentNote.updatedAt)}
          </p>
        </div>

        {/* Content Editor */}
        <div className="p-4 sm:p-6 lg:p-8">
          <textarea
            ref={textareaRef}
            value={currentNote.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start typing your note...

You can write anything here - ideas, thoughts, code snippets, or just random notes. Everything syncs in real-time!"
            className="w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] p-4 sm:p-6
                     border-2 border-gray-200 rounded-lg sm:rounded-xl
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                     resize-none font-mono text-sm sm:text-base leading-relaxed
                     transition-all duration-200"
          />

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
            <span>
              {currentNote.content.length.toLocaleString()} characters
            </span>
            {currentNote.content.length > 40000 && (
              <span className="text-orange-600 font-medium">
                Approaching maximum length (50,000 characters)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div
        className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 
                    border-2 border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2 text-base sm:text-lg">
              Real-time Collaboration
            </h3>
            <p className="text-sm sm:text-base text-blue-700 leading-relaxed">
              Changes are automatically synced across all open sessions. Your
              edits are saved every 2 seconds.
              {activeUsers > 1 && (
                <span className="font-medium">
                  {" "}
                  {activeUsers - 1} other{" "}
                  {activeUsers === 2 ? "person is" : "people are"} editing this
                  note right now.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
