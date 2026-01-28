import { z } from 'zod';

const FormFieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["text", "email", "tel", "textarea", "select", "checkbox", "radio", "number", "date"]),
  label: z.string().min(1),
  placeholder: z.string().optional(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional()
  }).optional()
});
const FormConfigCreateSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  submit_text: z.string().default("Отправить"),
  fields: z.array(FormFieldSchema).min(1, "Добавьте хотя бы одно поле"),
  bot_token_encrypted: z.string().optional(),
  chat_id: z.string().optional(),
  message_template: z.string().min(1),
  is_active: z.boolean().default(true)
});
const FormConfigUpdateSchema = FormConfigCreateSchema.partial();
const FormSubmissionSchema = z.object({
  form_id: z.string().uuid(),
  user_id: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  data: z.record(z.any()),
  initData: z.string()
  // для проверки подписи
});

export { FormConfigUpdateSchema as F, FormConfigCreateSchema as a, FormSubmissionSchema as b };
