const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(cors());
app.use(bodyParser.json());

const reactAppPath = path.resolve("../path-to-your-react-app");

// Helper function to get full path
const getFullPath = (subPath) => path.join(reactAppPath, subPath);

// READ: Get list of files and directories
app.get("/files", (req, res) => {
  const dirPath = getFullPath(req.query.path || "");
  fs.readdir(dirPath, { withFileTypes: true }, (err, items) => {
    if (err) {
      return res.status(500).send("Unable to scan directory");
    }
    const files = items.map((item) => ({
      name: item.name,
      isDirectory: item.isDirectory(),
    }));
    res.send(files);
  });
});

// READ: Get file content
app.get("/files/:name", (req, res) => {
  const fileName = getFullPath(req.params.name);
  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Unable to read file");
    }
    res.send(data);
  });
});

// CREATE: Create a new file
app.post("/files/:name", (req, res) => {
  const fileName = getFullPath(req.params.name);
  const content = req.body.content || "";

  fs.writeFile(fileName, content, "utf8", (err) => {
    if (err) {
      return res.status(500).send("Unable to create file");
    }
    res.send("File created successfully");
  });
});

// CREATE: Create a new directory
app.post("/directories/:name", (req, res) => {
  const dirName = getFullPath(req.params.name);

  fs.mkdir(dirName, (err) => {
    if (err) {
      return res.status(500).send("Unable to create directory");
    }
    res.send("Directory created successfully");
  });
});

// UPDATE: Update an existing file
app.put("/files/:name", (req, res) => {
  const fileName = getFullPath(req.params.name);
  const content = req.body.content;

  fs.writeFile(fileName, content, "utf8", (err) => {
    if (err) {
      return res.status(500).send("Unable to update file");
    }
    res.send("File updated successfully");
  });
});

// DELETE: Delete a file
app.delete("/files/:name", (req, res) => {
  const fileName = getFullPath(req.params.name);

  fs.unlink(fileName, (err) => {
    if (err) {
      return res.status(500).send("Unable to delete file");
    }
    res.send("File deleted successfully");
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
