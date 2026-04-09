const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./db");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// CREATE
app.post("/api/pasien", async (req, res) => {
  try {
    const { nama, umur, diagnosa } = req.body;

    if (!nama || !umur || !diagnosa) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi."
      });
    }

    const [result] = await db.execute(
      "INSERT INTO pasien (nama, umur, diagnosa) VALUES (?, ?, ?)",
      [nama, umur, diagnosa]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        nama,
        umur,
        diagnosa
      },
      message: "Data pasien berhasil ditambahkan"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// READ
app.get("/api/pasien", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM pasien ORDER BY id DESC"
    );

    res.json({
      success: true,
      data: rows,
      message: "Data berhasil diambil"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// UPDATE
app.put("/api/pasien/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, umur, diagnosa } = req.body;

    if (!nama || !umur || !diagnosa) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi."
      });
    }

    const [result] = await db.execute(
      "UPDATE pasien SET nama=?, umur=?, diagnosa=? WHERE id=?",
      [nama, umur, diagnosa, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan."
      });
    }

    res.json({
      success: true,
      message: "Data berhasil diupdate"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// DELETE
app.delete("/api/pasien/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "DELETE FROM pasien WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan."
      });
    }

    res.json({
      success: true,
      message: "Data berhasil dihapus"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});