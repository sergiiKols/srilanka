export const prerender = false;
import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const SKILLS_DIR = path.join(process.cwd(), '.agent', 'skills');

// POST - протестировать выполнение skill
export const POST: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Skill ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const skillPath = path.join(SKILLS_DIR, id);
    const scriptsPath = path.join(skillPath, 'scripts');

    // Проверяем существование skill
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

    // Проверяем структуру
    const checks = {
      skillMdExists: false,
      scriptsFolderExists: false,
      hasScripts: false,
      scripts: [] as string[]
    };

    try {
      await fs.access(path.join(skillPath, 'SKILL.md'));
      checks.skillMdExists = true;
    } catch { }

    try {
      const stats = await fs.stat(scriptsPath);
      checks.scriptsFolderExists = stats.isDirectory();

      if (checks.scriptsFolderExists) {
        const files = await fs.readdir(scriptsPath);
        checks.scripts = files.filter(f => !f.startsWith('.'));
        checks.hasScripts = checks.scripts.length > 0;
      }
    } catch { }

    // Если есть скрипты, пытаемся запустить первый
    let executionResult = null;
    if (checks.hasScripts && checks.scripts.length > 0) {
      const scriptFile = checks.scripts[0];
      const scriptPath = path.join(scriptsPath, scriptFile);

      try {
        // Определяем как запускать скрипт
        let command = '';
        if (scriptFile.endsWith('.py')) {
          command = `python "${scriptPath}"`;
        } else if (scriptFile.endsWith('.js') || scriptFile.endsWith('.ts')) {
          command = `node "${scriptPath}"`;
        } else if (scriptFile.endsWith('.sh')) {
          command = `bash "${scriptPath}"`;
        } else {
          executionResult = {
            success: false,
            error: `Unknown script type: ${scriptFile}`
          };
        }

        if (command) {
          const { stdout, stderr } = await execAsync(command, {
            cwd: skillPath,
            timeout: 30000 // 30 секунд timeout
          });

          executionResult = {
            success: true,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            script: scriptFile
          };
        }
      } catch (error: any) {
        executionResult = {
          success: false,
          error: error.message,
          stdout: error.stdout?.trim() || '',
          stderr: error.stderr?.trim() || '',
          script: scriptFile
        };
      }
    }

    return new Response(JSON.stringify({
      success: true,
      skillId: id,
      checks,
      execution: executionResult,
      message: getValidationMessage(checks, executionResult)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error testing skill:', error);
    return new Response(JSON.stringify({
      error: 'Failed to test skill',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

function getValidationMessage(checks: any, execution: any): string {
  const messages: string[] = [];

  if (!checks.skillMdExists) {
    messages.push('⚠️ SKILL.md file is missing');
  } else {
    messages.push('✅ SKILL.md file exists');
  }

  if (!checks.scriptsFolderExists) {
    messages.push('⚠️ scripts/ folder is missing');
  } else {
    messages.push('✅ scripts/ folder exists');
  }

  if (checks.hasScripts) {
    messages.push(`✅ Found ${checks.scripts.length} script(s): ${checks.scripts.join(', ')}`);
  } else {
    messages.push('ℹ️ No scripts found in scripts/ folder');
  }

  if (execution) {
    if (execution.success) {
      messages.push(`✅ Script executed successfully: ${execution.script}`);
    } else {
      messages.push(`❌ Script execution failed: ${execution.error}`);
    }
  }

  return messages.join('\n');
}
