---
description: Fetch an Azure DevOps user story and produce a reviewed implementation plan for this Nx Angular monorepo
agent: planner
---

Create an implementation plan for Azure DevOps work item **AB#${input:workItemId:Work item ID, e.g. 123}**.

${input:figmaUrl:Optional Figma frame URL (leave blank if none)}

Steps:

1. Fetch the work item and quote its title, description, and acceptance criteria verbatim.
2. If a Figma URL was given, read the design context and list variables/components used.
3. Explore the workspace to identify affected Nx projects and reusable code.
4. Output the plan in the standard planner format (acceptance criteria → affected projects → steps → tests → tokens → risks → branch name → suggested ADO tasks).
5. Ask whether to create child Tasks in Azure DevOps under this story.
