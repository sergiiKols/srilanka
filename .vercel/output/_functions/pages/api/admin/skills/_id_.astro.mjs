import fs from 'fs/promises';
import path from 'path';
export { renderers } from '../../../../renderers.mjs';

const SKILLS_DIR = path.join(process.cwd(), ".agent", "skills");
const GET = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Skill ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const skillPath = path.join(SKILLS_DIR, id);
    const skillMdPath = path.join(skillPath, "SKILL.md");
    try {
      const content = await fs.readFile(skillMdPath, "utf-8");
      const nameMatch = content.match(/##\s*Name:\s*(.+)/);
      const descMatch = content.match(/##\s*Description:\s*(.+)/);
      return new Response(JSON.stringify({
        id,
        name: nameMatch ? nameMatch[1].trim() : id,
        description: descMatch ? descMatch[1].trim() : "",
        content,
        path: skillPath
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Skill not found",
        message: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error getting skill:", error);
    return new Response(JSON.stringify({
      error: "Failed to get skill",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const PUT = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Skill ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { name, description, content } = body;
    if (!content) {
      return new Response(JSON.stringify({
        error: "Content is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const skillPath = path.join(SKILLS_DIR, id);
    const skillMdPath = path.join(skillPath, "SKILL.md");
    try {
      await fs.access(skillPath);
    } catch {
      return new Response(JSON.stringify({
        error: "Skill not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const oldContent = await fs.readFile(skillMdPath, "utf-8");
      const backupPath = path.join(skillPath, `SKILL.md.backup.${Date.now()}`);
      await fs.writeFile(backupPath, oldContent, "utf-8");
    } catch {
    }
    await fs.writeFile(skillMdPath, content, "utf-8");
    return new Response(JSON.stringify({
      success: true,
      skill: { id, name, description }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    return new Response(JSON.stringify({
      error: "Failed to update skill",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Skill ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const skillPath = path.join(SKILLS_DIR, id);
    try {
      await fs.access(skillPath);
    } catch {
      return new Response(JSON.stringify({
        error: "Skill not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await fs.rm(skillPath, { recursive: true, force: true });
    return new Response(JSON.stringify({
      success: true,
      message: "Skill deleted successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return new Response(JSON.stringify({
      error: "Failed to delete skill",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
