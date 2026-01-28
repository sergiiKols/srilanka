import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

const SKILLS_DIR = path.join(process.cwd(), '.agent', 'skills');

// GET - получить список всех skills
export const GET: APIRoute = async () => {
  try {
    // Проверяем существование директории
    try {
      await fs.access(SKILLS_DIR);
    } catch {
      // Создаём директорию если не существует
      await fs.mkdir(SKILLS_DIR, { recursive: true });
    }

    const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
    const skills = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(SKILLS_DIR, entry.name);
        const skillMdPath = path.join(skillPath, 'SKILL.md');
        
        try {
          const content = await fs.readFile(skillMdPath, 'utf-8');
          
          // Парсим метаданные из SKILL.md
          const nameMatch = content.match(/##\s*Name:\s*(.+)/);
          const descMatch = content.match(/##\s*Description:\s*(.+)/);
          
          skills.push({
            id: entry.name,
            name: nameMatch ? nameMatch[1].trim() : entry.name,
            description: descMatch ? descMatch[1].trim() : 'No description',
            path: skillPath,
            hasScripts: await hasScriptsFolder(skillPath)
          });
        } catch (error) {
          // Если SKILL.md не найден, всё равно добавляем skill
          skills.push({
            id: entry.name,
            name: entry.name,
            description: 'SKILL.md not found',
            path: skillPath,
            hasScripts: await hasScriptsFolder(skillPath),
            error: true
          });
        }
      }
    }

    return new Response(JSON.stringify({ skills }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error listing skills:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to list skills',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST - создать новый skill
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, description, content } = body;

    if (!id || !name || !content) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: id, name, content' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Проверяем что id валидный (только буквы, цифры, дефис)
    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid skill ID. Use only letters, numbers, and hyphens.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const skillPath = path.join(SKILLS_DIR, id);
    
    // Проверяем что skill не существует
    try {
      await fs.access(skillPath);
      return new Response(JSON.stringify({ 
        error: 'Skill already exists' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      // Skill не существует - хорошо
    }

    // Создаём структуру
    await fs.mkdir(skillPath, { recursive: true });
    await fs.mkdir(path.join(skillPath, 'scripts'), { recursive: true });
    
    // Сохраняем SKILL.md
    await fs.writeFile(
      path.join(skillPath, 'SKILL.md'),
      content,
      'utf-8'
    );

    return new Response(JSON.stringify({ 
      success: true,
      skill: { id, name, description }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create skill',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function hasScriptsFolder(skillPath: string): Promise<boolean> {
  try {
    const scriptsPath = path.join(skillPath, 'scripts');
    const stats = await fs.stat(scriptsPath);
    if (!stats.isDirectory()) return false;
    
    const files = await fs.readdir(scriptsPath);
    return files.length > 0;
  } catch {
    return false;
  }
}
