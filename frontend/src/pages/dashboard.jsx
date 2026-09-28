import { useEffect, useState } from "react";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../services/api";

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch notes
  const loadNotes = async () => {
    try {
      const data = await getNotes(token);
      setNotes(data.notes);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Create / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      if (editingId) {
        await updateNote(token, editingId, {
          title,
          content,
        });
      } else {
        await createNote(token, {
          title,
          content,
        });
      }

      setTitle("");
      setContent("");
      setEditingId(null);
      setError("");

      await loadNotes();
    } catch (error) {
      setError(error.message);
    }
  };

  // Edit
  const handleEdit = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await deleteNote(token, id);
      await loadNotes();
    } catch (error) {
      setError(error.message);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.reload();
  };

  return (
    <div>
      <h1>Notes Dashboard</h1>

      <p>
        Welcome, <strong>{user?.name}</strong>
      </p>

      <button onClick={handleLogout}>
        Logout
      </button>

      <hr />

      <h2>
        {editingId ? "Edit Note" : "Create Note"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <br />

        <div>
          <textarea
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5"
          />
        </div>

        <br />

        <button type="submit">
          {editingId ? "Update Note" : "Create Note"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setTitle("");
              setContent("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {error && <p>{error}</p>}

      <hr />

      <h2>Your Notes</h2>

      {notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        notes.map((note) => (
          <div key={note.id}>
            <h3>{note.title}</h3>

            <p>{note.content}</p>

            <small>
              Created: {note.created_at}
            </small>

            <br />
            <br />

            <button onClick={() => handleEdit(note)}>
              Edit
            </button>

            <button onClick={() => handleDelete(note.id)}>
              Delete
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;