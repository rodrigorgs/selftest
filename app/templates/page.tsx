'use client';

import { useState, useEffect } from "react";
import { PrismaJson } from "@/prisma/types";
import { QuestionRequestTemplate } from "../generated/prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

export default function QuestionRequestTemplates() {
  const [templates, setTemplates] = useState<QuestionRequestTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState<any>({
    name: "",
    promptTemplate: "",
    parameters: [] as PrismaJson.QuestionRequestTemplateParameter[],
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
    if (!newParameter.name) return;
    const valuesArray = newParameter.values.trim().length == 0 ? [] : newParameter.values.split(",").map((v) => v.trim());
    setNewTemplate({
      ...newTemplate,
      parameters: [
        ...newTemplate.parameters,
        { ...newParameter, values: valuesArray },
      ],
    });
    setNewParameter({ name: "", values: "", multipleSelect: false });
  }

  function removeParameter(index: number) {
    setNewTemplate({
      ...newTemplate,
      parameters: newTemplate.parameters.filter((_: any, i: number) => i !== index),
    });
  }

  async function removeTemplate(id: number) {
    await fetch(`/api/templates/${id}`, {
      method: "DELETE",
    });
    fetchTemplates();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Question Request Templates</h1>
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-xl font-semibold">Create New Template</h2>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            placeholder="Template Name"
            className="mb-2"
          />
          <Textarea
            value={newTemplate.promptTemplate}
            onChange={(e) => setNewTemplate({ ...newTemplate, promptTemplate: e.target.value })}
            placeholder="Prompt Template"
            className="mb-4"
          />
          <h3 className="text-lg font-medium">Parameters</h3>
          <ul className="mt-4">
            {newTemplate.parameters.map((param: any, index: any) => (
              <li key={index}>
                <strong>{param.name}</strong> ({param.multipleSelect ? "Multiple" : "Single"}): {param.values.join(", ")}
                <Button variant="destructive" onClick={() => removeParameter(index)} className="ml-2">
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <Card>
            <CardContent>
              <h3 className="text-lg font-medium mb-2">Add Parameter</h3>
              <Input
                type="text"
                value={newParameter.name}
                onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                placeholder="Parameter Name"
                className="mb-2"
              />
              <Input
                type="text"
                value={newParameter.values}
                onChange={(e) => setNewParameter({ ...newParameter, values: e.target.value })}
                placeholder="Comma-separated Values"
                className="mb-2"
              />
              <Checkbox id="check"
                checked={newParameter.multipleSelect}
                onCheckedChange={(checked) => setNewParameter({ ...newParameter, multipleSelect: !!checked })}
                className="mb-2"
              />
              <Label htmlFor="check"> Multiple selection</Label><br/>
              <Button onClick={addParameter} className="mt-2">Add Parameter</Button>
            </CardContent>
          </Card>
          <Button onClick={createTemplate} className="mt-4">Create Template</Button>
        </CardContent>
      </Card>
      <h2 className="text-xl font-semibold mb-4">Templates</h2>
      <ul className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <h3 className="text-lg font-medium">{template.name}</h3>
            </CardHeader>
            <CardContent>
              <p>{template.promptTemplate}</p>
              <ul className="mt-2 space-y-2">
                {template.parameters.map((param, index) => (
                  <li key={index}>
                    <strong>{param.name}</strong> ({param.multipleSelect ? "Multiple" : "Single"}): {param.values.join(", ")}
                  </li>
                ))}
              </ul>
              <Button onClick={() => removeTemplate(template.id)} className="ml-4">Remove</Button>
            </CardContent>
          </Card>
        ))}
      </ul>
    </div>
  );
}