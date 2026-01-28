# MCP Skills Integration

This project is equipped with the **Model Context Protocol (MCP)** Skills framework.
This allows AI agents to perform specialized tasks by following structured instructions found in the `.agent/skills` directory.

## Directory Structure

- **`.agent/skills/`**: Contains all available skills.
  - Each skill has its own directory (e.g., `hello-world`).
  - **`SKILL.md`**: Defines the skill's purpose, usage instructions, and required context.
  - **`scripts/`**: Contains helper scripts (Python, Node.js, etc.) that the skill may execute.

## How to Use

When working with an AI agent that supports MCP Skills:

1.  **Discovery**: The agent can list the contents of `.agent/skills` to see what tools are available.
2.  **Instruction**: The agent reads the `SKILL.md` file of a specific skill to understand how to use it.
3.  **Execution**: The agent follows the instructions, which may involve running scripts provided in the skill's folder.

## Available Skills

### `hello-world`
A demonstration skill to verify that the system is working.
- **Path**: `.agent/skills/hello-world`
- **Action**: Prints a greeting message.

## Adding New Skills

To add a new skill:
1. Create a new directory in `.agent/skills/<skill-name>`.
2. Create a `SKILL.md` file following the template in `hello-world`.
3. Add any necessary scripts or resources to the skill folder.
