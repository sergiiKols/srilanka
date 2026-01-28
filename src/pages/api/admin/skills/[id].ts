import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

const SKILLS_DIR = path.join(process.cwd(), '.agent', 'skills');

// GET - получить конкретный skill
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Skill ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const skillPath = path.join(SKILLS_DIR, id);
    const skillMdPath = path.join(skillPath, 'SKILL.md');

    try {
      const content = await fs.readFile(skillMdPath, 'utf-8');
      
      // Парсим метаданные
      const nameMatch = content.match(/##\s*Name:\s*(.+)/);
      const descMatch = content.match(/##\s*Description:\s*(.+)/);

      return new Response(JSON.stringify({
        id,
        name: nameMatch ? nameMatch[1].trim() : id,
        description: descMatch ? descMatch[1].trim() : '',
        content,
        path: skillPath
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Skill not found',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error getting skill:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get skill',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT - обновить skill
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Skill ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { name, description, content } = body;

    if (!content) {
      return new Response(JSON.stringify({ 
        error: 'Content is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const skillPath = path.join(SKILLS_DIR, id);
    const skillMdPath = path.join(skillPath, 'SKILL.md');

    // Проверяем что skill существует
    try {
      await fs.access(skillPath);
    } catch {
      return new Response(JSON.stringify({ 
        error: 'Skill not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Создаём backup перед обновлением
    try {
      const oldContent = await fs.readFile(skillMdPath, 'utf-8');
      const backupPath = path.join(skillPath, `SKILL.md.backup.${Date.now()}`);
      await fs.writeFile(backupPath, oldContent, 'utf-8');
    } catch {
      // Если backup не удался - продолжаем
    }

    // Сохраняем новый контент
    await fs.writeFile(skillMdPath, content, 'utf-8');

    return new Response(JSON.stringify({ 
      success: true,
      skill: { id, name, description }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to update skill',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE - удалить skill
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Skill ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const skillPath = path.join(SKILLS_DIR, id);

    // Проверяем что skill существует
    try {
      await fs.access(skillPath);
    } catch {
      return new Response(JSON.stringify({ 
        error: 'Skill not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Удаляем директорию со всем содержимым
    await fs.rm(skillPath, { recursive: true, force: true });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Skill deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete skill',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
