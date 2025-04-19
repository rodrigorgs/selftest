'use client';

import { PrismaJson } from "@/prisma/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Template = {
  id?: number;
  name: string;
  promptTemplate: string;
  parameters: PrismaJson.QuestionRequestTemplateParameter[];
};

type TemplateFormProps = {
  defaultValues?: Template;
  onSubmit: (data: Template) => void;
  mode: 'create' | 'edit';
};

export default function TemplateForm({ defaultValues, onSubmit, mode }: TemplateFormProps) {
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

  const [newTemplate, setNewTemplate] = useState<Template>({
    name: defaultValues?.name || "",
    promptTemplate: defaultValues?.promptTemplate || "",
    parameters: defaultValues?.parameters || [],
  });
  const [newParameter, setNewParameter] = useState({
    name: "",
    values: "",
    multipleSelect: false,
  });

  function addParameter() {
    if (!newParameter.name) return;
    const valuesArray = newParameter.values.trim().length == 0 ? [] : newParameter.values.split(";").map((v) => v.trim());
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
                placeholder="Semicolon-separated Values (e.g. value1; value2)"
                className="mb-2"
              />
              <Checkbox id="check"
                checked={newParameter.multipleSelect}
                onCheckedChange={(checked) => setNewParameter({ ...newParameter, multipleSelect: !!checked })}
                className="mb-2"
              />
              <Label htmlFor="check"> Multiple selection</Label><br />
              <Button onClick={addParameter} className="mt-2">Add Parameter</Button>
            </CardContent>
          </Card>
          <Button onClick={() => onSubmit(newTemplate)} className="mt-4">{mode == 'create' ? 'Create' : 'Update'}</Button>
        </CardContent>
      </Card>
    </div>);
}
