import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "./dstyle.css";

// Utility function to join paths
const joinPaths = (...parts) => {
  return parts
    .map((part, i) => {
      if (i === 0) {
        return part.trim().replace(/[/]*$/g, "");
      } else {
        return part.trim().replace(/(^[/]*|[/]*$)/g, "");
      }
    })
    .filter((part) => part.length)
    .join("/");
};

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newDirName, setNewDirName] = useState("");

  useEffect(() => {
    const fetchFiles = async (path = "") => {
      try {
        const res = await fetch(`http://localhost:4000/files?path=${path}`);
        const data = await res.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles(currentPath);
  }, [currentPath]);

  const handleFileClick = async (file) => {
    if (file.isDirectory) {
      setCurrentPath(joinPaths(currentPath, file.name));
    } else {
      try {
        const res = await fetch(`http://localhost:4000/files/${joinPaths(currentPath, file.name)}`);
        const data = await res.text();
        setSelectedFile(joinPaths(currentPath, file.name));
        setFileContent(data);
      } catch (error) {
        console.error("Error fetching file content:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`http://localhost:4000/files/${selectedFile}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: fileContent }),
      });
      alert("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await fetch(`http://localhost:4000/files/${selectedFile}`, {
          method: "DELETE",
        });
        alert("File deleted successfully!");
        setFiles(files.filter((file) => joinPaths(currentPath, file.name) !== selectedFile));
        setSelectedFile("");
        setFileContent("");
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const handleBack = () => {
    setCurrentPath(currentPath.split("/").slice(0, -1).join("/"));
  };

  const handleCreateFile = async () => {
    const filePath = joinPaths(currentPath, newFileName);
    try {
      await fetch(`http://localhost:4000/files/${filePath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "" }),
      });
      setFiles([...files, { name: newFileName, isDirectory: false }]);
      setNewFileName("");
    } catch (error) {
      console.error("Error creating file:", error);
    }
  };

  const handleCreateDirectory = async () => {
    const dirPath = joinPaths(currentPath, newDirName);
    try {
      await fetch(`http://localhost:4000/directories/${dirPath}`, {
        method: "POST",
      });
      setFiles([...files, { name: newDirName, isDirectory: true }]);
      setNewDirName("");
    } catch (error) {
      console.error("Error creating directory:", error);
    }
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [fileContent]);

  return (
    <div className="container">
      <h1 className="header">React App Code Editor</h1>
      <div className="main">
        <div className="file-list">
          <h2>Files</h2>
          {currentPath && <button onClick={handleBack}>Back</button>}
          <ul>
            {files.map((file) => (
              <li key={file.name} onClick={() => handleFileClick(file)} className={selectedFile === joinPaths(currentPath, file.name) ? "selected" : ""}>
                {file.name} {file.isDirectory ? "(Directory)" : ""}
              </li>
            ))}
          </ul>
          <div>
            <input type="text" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder="New file name" />
            <button onClick={handleCreateFile}>Create File</button>
          </div>
          <div>
            <input type="text" value={newDirName} onChange={(e) => setNewDirName(e.target.value)} placeholder="New directory name" />
            <button onClick={handleCreateDirectory}>Create Directory</button>
          </div>
        </div>
        <div className="editor-container">
          <h2>Editor</h2>
          {selectedFile && (
            <div>
              <h3>{selectedFile}</h3>
              <Editor
                height="80vh"
                language="javascript"
                value={fileContent}
                onChange={(value) => setFileContent(value)}
                options={{
                  wordWrap: "on",
                }}
              />
              <pre>
                <code className="language-javascript">{fileContent}</code>
              </pre>
              <br />
              <button onClick={handleSave}>Save</button>
              <button onClick={handleDelete} style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
