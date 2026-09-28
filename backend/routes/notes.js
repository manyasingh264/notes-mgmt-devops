const express = require("express");

const db = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ==================== CREATE NOTE ====================

router.post("/", authenticateToken, (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const result = db
      .prepare(
        `
        INSERT INTO notes (title, content, user_id)
        VALUES (?, ?, ?)
        `
      )
      .run(title, content, req.user.id);

    const note = db
      .prepare("SELECT * FROM notes WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create note",
    });
  }
});

// ==================== GET ALL NOTES ====================

router.get("/", authenticateToken, (req, res) => {
  try {
    const notes = db
      .prepare(
        `
        SELECT *
        FROM notes
        WHERE user_id = ?
        ORDER BY created_at DESC
        `
      )
      .all(req.user.id);

    res.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
    });
  }
});

// ==================== GET SINGLE NOTE ====================

router.get("/:id", authenticateToken, (req, res) => {
  try {
    const note = db
      .prepare(
        `
        SELECT *
        FROM notes
        WHERE id = ? AND user_id = ?
        `
      )
      .get(req.params.id, req.user.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch note",
    });
  }
});

// ==================== UPDATE NOTE ====================

router.put("/:id", authenticateToken, (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const existingNote = db
      .prepare(
        `
        SELECT *
        FROM notes
        WHERE id = ? AND user_id = ?
        `
      )
      .get(req.params.id, req.user.id);

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    db.prepare(
      `
      UPDATE notes
      SET title = ?,
          content = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
      `
    ).run(title, content, req.params.id, req.user.id);

    const updatedNote = db
      .prepare("SELECT * FROM notes WHERE id = ?")
      .get(req.params.id);

    res.json({
      success: true,
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update note",
    });
  }
});

// ==================== DELETE NOTE ====================

router.delete("/:id", authenticateToken, (req, res) => {
  try {
    const result = db
      .prepare(
        `
        DELETE FROM notes
        WHERE id = ? AND user_id = ?
        `
      )
      .run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete note",
    });
  }
});

module.exports = router;