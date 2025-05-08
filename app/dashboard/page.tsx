'use client';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import React, { Suspense, useEffect, useState } from "react";
import { fetchRequestsForTemplate, fetchTemplate, fetchUsersWhoUsedTemplate, fetchTemplates } from "./server";
import { QuestionRequestTemplate, User } from "../generated/prisma";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  return <Suspense>
    <DashboardInner />
  </Suspense>
}

// question type; parameter
function DashboardInner() {
  const parameterName = 'topico'; // Parameter name to filter by
  const [templates, setTemplates] = useState<any[]>([]); // List of templates
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null); // Selected template ID
  const [parameterValues, setParameterValues] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [questionRequests, setQuestionRequests] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const templates = await fetchTemplates(); // Fetch all templates
      setTemplates(templates);
    })();
  }, []);

  useEffect(() => {
    if (selectedTemplateId === null) return;

    (async () => {
      const template = await fetchTemplate(selectedTemplateId);
      const param = template.parameters.find(p => p.name === parameterName);
      setParameterValues(param?.values || []);
      setUsers(await fetchUsersWhoUsedTemplate(template.id));
      const requests = await fetchRequestsForTemplate(template.id);
      setQuestionRequests(requests);
    })();
  }, [selectedTemplateId]);

  return <div>

    Select a question template:
    <Select key="mysel" onValueChange={(value) => { setSelectedTemplateId(Number(value)); }}>
      <SelectTrigger>
        <SelectValue placeholder={`Select template`} />
      </SelectTrigger>
      <SelectContent>
        {templates.map((template: QuestionRequestTemplate, index: number) => (
          <SelectItem key={`k${index}`} value={template.id.toString()}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left">User</TableHead>
          {parameterValues.map(v => (
            <React.Fragment key={v}>
              <TableHead className="text-center">{v.substring(0, 7)}</TableHead>
            </React.Fragment>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={`u${user.id}`}>
            <TableCell>{user.name}</TableCell>
            {parameterValues.map(value => (
              <React.Fragment key={value}>
                {(() => {
                  const x = Math.max(
                    ...questionRequests
                      .filter(r => r.userId === user.id)
                      .filter(r => r.parameterValues.find((p: any) => p.name === parameterName && p.values.includes(value)))
                      .map(r => r.questions.filter((q: any) => q.answers.find((a: any) => a.correct)).length)
                  );
                  return (
                    <TableCell
                      className={`text-center ${x !== 0 && x !== -Infinity ? 'bg-gray-200' : ''}`}
                    >
                      {x === -Infinity ? '' : x}
                    </TableCell>
                  );
                })()}
              </React.Fragment>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>;
}