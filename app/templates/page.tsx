'use client';

// import { QuestionRequestTemplate  } from "../generated/prisma";
// Removed the incorrect import as Prisma types are not directly exported from '@prisma/client'
import { useState, useEffect } from "react";
import { PrismaJson } from "@/prisma/types";
import { QuestionRequestTemplate } from "../generated/prisma/client";

export default function QuestionRequestTemplates() {
  const [templates, setTemplates] = useState<QuestionRequestTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState<any>({
    name: "",
    promptTemplate: "",
    parameters: [] as PrismaJson.QuestionRequestTemplateParameter[], // Ensure PrismaJson is correctly defined elsewhere
  });
  const [newParameter, setNewParameter] = useState({
    name: "",
    values: "",
    multipleSelect: false,
  });

  async function fetchTemplates() {
    const response = await fetch("/api/templates");
    const data = await response.json();
    setTemplates(data);
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function createTemplate() {
    if (!newTemplate.name || !newTemplate.promptTemplate) return;
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTemplate),
    });
    setNewTemplate({ name: "", promptTemplate: "", parameters: [] });
    fetchTemplates();
  }

  function addParameter() {
    if (!newParameter.name || !newParameter.values) return;
    const valuesArray = newParameter.values.split(",").map((v) => v.trim());
    setNewTemplate({
      ...newTemplate,
      parameters: [
        ...newTemplate.parameters,
        { ...newParameter, values: valuesArray },
      ],
    });
    setNewParameter({ name: "", values: "", multipleSelect: false });
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Question Request Templates</h1>
      <div>
        <input
          type="text"
          value={newTemplate.name}
          onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
          placeholder="Template Name"
          style={{ marginRight: "0.5rem" }}
        />
        <textarea
          value={newTemplate.promptTemplate}
          onChange={(e) => setNewTemplate({ ...newTemplate, promptTemplate: e.target.value })}
          placeholder="Prompt Template"
          style={{ marginRight: "0.5rem", display: "block", marginTop: "0.5rem" }}
        />
        <div style={{ marginTop: "1rem" }}>
          <h3>Add Parameter</h3>
          <input
            type="text"
            value={newParameter.name}
            onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
            placeholder="Parameter Name"
            style={{ marginRight: "0.5rem" }}
          />
          <input
            type="text"
            value={newParameter.values}
            onChange={(e) => setNewParameter({ ...newParameter, values: e.target.value })}
            placeholder="Comma-separated Values"
            style={{ marginRight: "0.5rem" }}
          />
          <label>
            <input
              type="checkbox"
              checked={newParameter.multipleSelect}
              onChange={(e) =>
                setNewParameter({ ...newParameter, multipleSelect: e.target.checked })
              }
            />
            Multiple Select
          </label>
          <button onClick={addParameter} style={{ marginLeft: "0.5rem" }}>
            Add Parameter
          </button>
        </div>
        <button onClick={createTemplate} style={{ marginTop: "1rem" }}>Create Template</button>
      </div>
      <h2>Templates</h2>
      <ul style={{ marginTop: "1rem" }}>
        {templates.map((template) => (
          <li key={template.id}>
            <strong>{template.name}</strong>: {template.promptTemplate}
            <ul>
              {template.parameters.map((param, index) => (
                <li key={index}>
                  <strong>{param.name}</strong> ({param.multipleSelect ? "Multiple" : "Single"}): {param.values.join(", ")}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}