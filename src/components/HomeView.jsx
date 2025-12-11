import React, { useState, useEffect } from "react";
import { Plus, Clock, FileText, Sparkles, Trash2 } from "lucide-react";

export default function HomeView({
  notes = [],
  loading,
  loadNotes,
  createNote,
  loadNote,
  deleteNote,
  formatDate,
}) {
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = async () => {
    if (!newTitle.trim() || creating) return;
    setCreating(true);
    await createNote(newTitle.trim());
    setNewTitle("");
    setCreating(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 mb-6 sm:mb-8 text-white shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Collaborative Notes
          </h1>
        </div>
        <p className="text-blue-100 text-base sm:text-lg lg:text-xl max-w-2xl">
          Create and edit notes in real-time with others. Your changes sync
          instantly.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm sm:text-base">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            <FileText className="w-4 h-4" />
            <span>{notes.length} Notes</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            <Clock className="w-4 h-4" />
            <span>Auto-save</span>
          </div>
        </div>
      </div>

      {/* Create Note Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-gray-800">
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          Create New Note
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter note title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateNote()}
            disabled={creating}
            className="flex-1 px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                      transition-all duration-200"
            maxLength={200}
          />
          <button
            onClick={handleCreateNote}
            disabled={!newTitle.trim() || creating}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600
                      text-white font-semibold rounded-lg sm:rounded-xl
                      hover:from-blue-700 hover:to-purple-700
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transform hover:scale-105 active:scale-95
                      transition-all duration-200 shadow-lg hover:shadow-xl
                      flex items-center justify-center gap-2 min-w-[120px]"
          >
            {creating ? (
              <span>Creating...</span>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Create</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notes List Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
          Your Notes
        </h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-base sm:text-lg">
              Loading notes...
            </p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <FileText className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 text-base sm:text-lg mb-2">
              No notes yet
            </p>
            <p className="text-gray-400 text-sm">
              Create your first note to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className="group p-4 sm:p-5 lg:p-6 border-2 border-gray-100 rounded-lg sm:rounded-xl
                          hover:border-blue-300 hover:bg-blue-50
                          transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div
                    onClick={() => loadNote(note._id)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h3
                      className="font-semibold text-lg sm:text-xl mb-2 text-gray-800
                                  group-hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {note.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base line-clamp-2 break-words">
                      {note.content || (
                        <span className="italic text-gray-400">Empty note</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(note.updatedAt)}</span>
                    </div>
                    <button
                      onClick={() => deleteNote(note._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notes.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {notes.length} {notes.length === 1 ? "note" : "notes"}
        </div>
      )}
    </div>
  );
}
