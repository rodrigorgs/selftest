'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { QuestionRequestTemplate } from "../../generated/prisma";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { PrismaJson } from "@/prisma/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function QuestionRequestCreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  const [templates, setTemplates] = useState<QuestionRequestTemplate[]>([]);
  const [template, setTemplate] = useState<QuestionRequestTemplate | null>(null);
  const [newRequest, setNewRequest] = useState({
    parameterValues: [] as PrismaJson.QuestionRequestParameterValue[],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchTemplates() {
      const response = await fetch("/api/templates");
      const data = await response.json();
      setTemplates(data);
    }
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (template) {
      const initialValues = template.parameters.map((param) => ({
        name: param.name,
        values: param.multipleSelect ? [] : [""],
      }));
      setNewRequest({ parameterValues: initialValues });
    }
  }, [template]);

  function renderParameterInput(parameter: PrismaJson.QuestionRequestTemplateParameter, key: string): any {
    if (parameter.values && parameter.values.length > 0) {
      if (parameter.multipleSelect) {
        return <MultiSelect
          key={key}
          placeholder={`Select ${parameter.name}`}
          options={parameter.values.map((value) => ({ value, label: value }))}
          onValueChange={(values) => handleParameterChange(parameter, values)}
        />
      } else {
        return <Select onValueChange={(value => handleParameterChange(parameter, [value]))} key={key}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${parameter.name}`} />
          </SelectTrigger>
          <SelectContent>
            {parameter.values.map((value: string) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    } else {
      return <Input
        key={key}
        type="text"
        value={newRequest.parameterValues.find((param) => param.name === parameter.name)?.values[0] || ""}
        onChange={(e) => handleParameterChange(parameter, [e.target.value])}
        placeholder={`Enter ${parameter.name}`}
        className="mb-2"
      />;
    }
  }

  function handleParameterChange(parameter: PrismaJson.QuestionRequestTemplateParameter, values: string[]) {
    const updatedValues = newRequest.parameterValues.map((param) => {
      if (param.name === parameter.name) {
        return { ...param, values: values };
      }
      return param;
    });
    setNewRequest({ ...newRequest, parameterValues: updatedValues });
  }

  function renderSelectTemplate() {
    return <Select onValueChange={(value) => value ? setTemplate(templates.find((t) => `${t.id}` === value) || null) : setTemplate(null)}>
      <SelectTrigger>
        <SelectValue placeholder="Select a template" />
      </SelectTrigger>
      <SelectContent>
        {templates.map((template: QuestionRequestTemplate) => (
          <SelectItem key={template.id} value={`${template.id}`}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>;
  }

  async function createRequest() {
    if (!template) return;

    // Validate that all parameters have values
    const missingParameters = template.parameters.filter((parameter) => {
      const paramValue = newRequest.parameterValues.find((param) => param.name === parameter.name);
      return !paramValue || paramValue.values.length === 0 || paramValue.values[0] === "";
    });

    if (missingParameters.length > 0) {
      alert(`Please select a value for the following parameters: ${missingParameters.map((p) => p.name).join(", ")}`);
      return;
    }

    const request = {
      templateId: template.id,
      parameterValues: newRequest.parameterValues,
    };
    setIsLoading(true);
    const response = await fetch("/api/questionRequests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    setIsLoading(false);
    if (response.ok) {
      window.location.href = `/questions?templateId=${template.id}`;
    } else {
      alert("Failed to create request");
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-10 p-6">
      <CardHeader className="text-center">
        <h1 className="text-4xl font-bold">Generate Questions</h1>
      </CardHeader>
      <CardContent>
        {renderSelectTemplate()}
        {template && template.parameters?.length > 0 && <>
          <h2 className="text-2xl font-semibold mt-4">Parameters</h2>
          {template.parameters.map((parameter: PrismaJson.QuestionRequestTemplateParameter) =>
            renderParameterInput(parameter, `param${parameter.name}`))}
        </>
        }
        {template &&
          (
            isLoading
              ? <Spinner>
                Generating questions...
              </Spinner>
              : <Button onClick={createRequest} disabled={isLoading}>
                {isLoading ? <span className="spinner" /> : "Generate Questions"}
              </Button>
          )
        }
      </CardContent>
    </Card>
  );

}