'use client';

import TemplateForm from "@/components/TemplateForm";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [template, setTemplate] = useState<any>(null);
  const id = use(params).id;

  console.log('id', id);

  async function fetchTemplate(id: string) {
    const response = await fetch(`/api/templates/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch template");
    }
    return response.json();
  }
  
  async function updateTemplate(newTemplate: any) {
    if (!newTemplate.name || !newTemplate.promptTemplate) return;
    console.log('Updating template:', newTemplate);
    await fetch(`/api/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTemplate),
    });
    router.push("/templates");
  }
  
  useEffect(() => {
    async function loadTemplate() {
      try {
        const templateData = await fetchTemplate(id);
        setTemplate(templateData);
      } catch (error) {
        console.error("Error fetching template:", error);
      }
    }
    loadTemplate();
  }, [id]);

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Edit Template</h1>
      <TemplateForm onSubmit={updateTemplate} mode="edit" defaultValues={template}/>
    </div>
  );
}