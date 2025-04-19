'use client';

import { useState, useEffect, Fragment } from "react";
import { PrismaJson } from "@/prisma/types";
import { QuestionRequestTemplate } from "../generated/prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function QuestionRequestTemplates() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated" && session?.user?.isAdmin === false) {
      alert("You do not have permission to access this page.");
      router.push("/");
    }
  }, [status, router]);

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

  async function removeTemplate(id: number) {
    await fetch(`/api/templates/${id}`, {
      method: "DELETE",
    });
    fetchTemplates();
  }

  return (
      <div>
        {/* Button to add */}
        <Button onClick={() => router.push("/templates/create")} className="mb-4">Create New Template</Button>
        {/* List of templates */}
        <h1 className="text-2xl font-bold mb-4">Question Request Templates</h1>
        <TemplateList templates={templates} removeTemplate={removeTemplate} />
      </div>
  );
}

function TemplateList(props: { templates: QuestionRequestTemplate[], removeTemplate: (id: number) => void }) {
  const { templates, removeTemplate } = props;

  const router = useRouter();

  return (<Fragment>
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
            <Button onClick={() => router.push(`/templates/${template.id}/edit`)} className="ml-4">Edit</Button>
          </CardContent>
        </Card>
      ))}
    </ul>
  </Fragment>);
}