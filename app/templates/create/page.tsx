'use client';

import TemplateForm from "@/components/TemplateForm";
import { useRouter } from "next/navigation";

export default function CreateTemplatePage() {
  const router = useRouter();

  async function createTemplate(newTemplate: any) {
    if (!newTemplate.name || !newTemplate.promptTemplate) return;
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTemplate),
    });
    router.push("/templates");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Create Template</h1>
      <TemplateForm onSubmit={createTemplate} mode="create" />
    </div>
  );
}