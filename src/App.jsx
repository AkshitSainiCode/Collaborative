import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { getSocket } from "./utils/socket";
import HomeView from "./components/HomeView";
import EditorView from "./components/EditorView";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(1);

  const socketRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const userIdRef = useRef(`user_${Math.random().toString(36).substr(2, 9)}`);

  // Initialize socket
  useEffect(() => {
    socketRef.current = getSocket();

    socketRef.current.on("connect", () => {
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current.on("note_updated", ({ noteId, content, title }) => {
      if (currentNote && currentNote._id === noteId) {
        setCurrentNote((prev) => ({
          ...prev,
          content,
          title,
        }));
      }
    });

    socketRef.current.on("active_users", ({ count }) => {
      setActiveUsers(count);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("note_updated");
        socketRef.current.off("active_users");
      }
    };
  }, [currentNote]);

  // Load notes
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/notes`);
      if (response.data.success) {
        setNotes(response.data.data);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create note
  const createNote = useCallback(async (title) => {
    try {
      const response = await axios.post(`${API_URL}/notes`, { title });
      if (response.data.success) {
        const newNote = response.data.data;
        setNotes((prev) => [newNote, ...prev]);
        setCurrentNote(newNote);
        setCurrentView("editor");

        // Join socket room
        socketRef.current.emit("join_note", {
          noteId: newNote._id,
          userId: userIdRef.current,
          username: "User",
        });
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
  }, []);

  // Load single note
  const loadNote = useCallback(async (noteId) => {
    try {
      const response = await axios.get(`${API_URL}/notes/${noteId}`);
      if (response.data.success) {
        setCurrentNote(response.data.data);
        setCurrentView("editor");

        // Join socket room
        socketRef.current.emit("join_note", {
          noteId: noteId,
          userId: userIdRef.current,
          username: "User",
        });
      }
    } catch (error) {
      console.error("Error loading note:", error);
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(
    async (noteId) => {
      try {
        const response = await axios.delete(`${API_URL}/notes/${noteId}`);
        if (response.data.success) {
          setNotes((prev) => prev.filter((n) => n._id !== noteId));
          if (currentNote?._id === noteId) {
            setCurrentNote(null);
            setCurrentView("home");
          }
        }
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    },
    [currentNote]
  );

  // Handle content change
  const handleContentChange = useCallback(
    (content) => {
      if (!currentNote) return;

      setCurrentNote((prev) => ({ ...prev, content }));

      // Emit to socket
      socketRef.current.emit("note_update", {
        noteId: currentNote._id,
        content,
        title: currentNote.title,
        userId: userIdRef.current,
      });

      // Auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus("saving");
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await axios.put(`${API_URL}/notes/${currentNote._id}`, { content });
          setSaveStatus("saved");
        } catch (error) {
          console.error("Error saving note:", error);
          setSaveStatus("error");
        }
      }, 2000);
    },
    [currentNote]
  );

  // Handle title change
  const handleTitleChange = useCallback(
    (title) => {
      if (!currentNote) return;

      setCurrentNote((prev) => ({ ...prev, title }));

      // Emit to socket
      socketRef.current.emit("note_update", {
        noteId: currentNote._id,
        content: currentNote.content,
        title,
        userId: userIdRef.current,
      });

      // Auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus("saving");
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await axios.put(`${API_URL}/notes/${currentNote._id}`, { title });
          setSaveStatus("saved");
        } catch (error) {
          console.error("Error saving note:", error);
          setSaveStatus("error");
        }
      }, 2000);
    },
    [currentNote]
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      {currentView === "home" ? (
        <HomeView
          notes={notes}
          loading={loading}
          loadNotes={loadNotes}
          createNote={createNote}
          loadNote={loadNote}
          deleteNote={deleteNote}
          formatDate={formatDate}
        />
      ) : (
        <EditorView
          currentNote={currentNote}
          activeUsers={activeUsers}
          saveStatus={saveStatus}
          isConnected={isConnected}
          setCurrentView={setCurrentView}
          setCurrentNote={setCurrentNote}
          handleContentChange={handleContentChange}
          handleTitleChange={handleTitleChange}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
