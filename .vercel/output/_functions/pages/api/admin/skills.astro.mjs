import fs from 'fs/promises';
import path from 'path';
export { r as renderers } from '../../../chunks/_@astro-renderers_1ISMqT13.mjs';

const SKILLS_DIR = path.join(process.cwd(), ".agent", "skills");
const GET = async () => {
  try {
    try {
      await fs.access(SKILLS_DIR);
    } catch {
      await fs.mkdir(SKILLS_DIR, { recursive: true });
    }
    const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
    const skills = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(SKILLS_DIR, entry.name);
        const skillMdPath = path.join(skillPath, "SKILL.md");
        try {
          const content = await fs.readFile(skillMdPath, "utf-8");
          const nameMatch = content.match(/##\s*Name:\s*(.+)/);
          const descMatch = content.match(/##\s*Description:\s*(.+)/);
          skills.push({
            id: entry.name,
            name: nameMatch ? nameMatch[1].trim() : entry.name,
            description: descMatch ? descMatch[1].trim() : "No description",
            path: skillPath,
            hasScripts: await hasScriptsFolder(skillPath)
          });
        } catch (error) {
          skills.push({
            id: entry.name,
            name: entry.name,
            description: "SKILL.md not found",
            path: skillPath,
            hasScripts: await hasScriptsFolder(skillPath),
            error: true
          });
        }
      }
    }
    return new Response(JSON.stringify({ skills }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error listing skills:", error);
    return new Response(JSON.stringify({
      error: "Failed to list skills",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, description, content } = body;
    if (!id || !name || !content) {
      return new Response(JSON.stringify({
        error: "Missing required fields: id, name, content"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
      return new Response(JSON.stringify({
        error: "Invalid skill ID. Use only letters, numbers, and hyphens."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const skillPath = path.join(SKILLS_DIR, id);
    try {
      await fs.access(skillPath);
      return new Response(JSON.stringify({
        error: "Skill already exists"
      }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    } catch {
    }
    await fs.mkdir(skillPath, { recursive: true });
    await fs.mkdir(path.join(skillPath, "scripts"), { recursive: true });
    await fs.writeFile(
      path.join(skillPath, "SKILL.md"),
      content,
      "utf-8"
    );
    return new Response(JSON.stringify({
      success: true,
      skill: { id, name, description }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating skill:", error);
    return new Response(JSON.stringify({
      error: "Failed to create skill",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
async function hasScriptsFolder(skillPath) {
  try {
    const scriptsPath = path.join(skillPath, "scripts");
    const stats = await fs.stat(scriptsPath);
    if (!stats.isDirectory()) return false;
    const files = await fs.readdir(scriptsPath);
    return files.length > 0;
  } catch {
    return false;
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
