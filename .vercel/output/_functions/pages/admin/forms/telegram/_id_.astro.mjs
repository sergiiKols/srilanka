import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, n as defineScriptVars, h as addAttribute, m as maybeRenderHead } from '../../../../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { j as jsxRuntimeExports, A as AdminLayout } from '../../../../chunks/AdminLayout_xmS9cJRX.mjs';
import { a as reactExports } from '../../../../chunks/_@astro-renderers_1ISMqT13.mjs';
export { r as renderers } from '../../../../chunks/_@astro-renderers_1ISMqT13.mjs';
import { useSensors, useSensor, PointerSensor, KeyboardSensor, DndContext, closestCenter } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { E as ErrorBoundary } from '../../../../chunks/ErrorBoundary_BH6ConEo.mjs';
import { r as requireAdminPage } from '../../../../chunks/auth_DRVvN-zp.mjs';

function FieldEditor({
  field,
  onUpdate,
  onDelete
}) {
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [editedField, setEditedField] = reactExports.useState(field);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  const handleSave = () => {
    onUpdate(editedField);
    setIsEditing(false);
    toast.success("Поле обновлено");
  };
  const handleCancel = () => {
    setEditedField(field);
    setIsEditing(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref: setNodeRef,
      style,
      className: "bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm",
      children: !isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              ...attributes,
              ...listeners,
              className: "cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 8h16M4 16h16" }) })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: field.label }),
              field.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 text-xs", children: "* обязательно" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-500", children: [
              "Тип: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: field.type }),
              field.placeholder && ` • Placeholder: "${field.placeholder}"`
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setIsEditing(true),
              className: "px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded",
              children: "Изменить"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: onDelete,
              className: "px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded",
              children: "Удалить"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1", children: "Метка поля *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: editedField.label,
              onChange: (e) => setEditedField({ ...editedField, label: e.target.value }),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1", children: "ID поля *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: editedField.id,
              onChange: (e) => setEditedField({ ...editedField, id: e.target.value }),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm",
              disabled: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1", children: "Тип *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: editedField.type,
              onChange: (e) => setEditedField({ ...editedField, type: e.target.value }),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "text", children: "Текст" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "email", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "tel", children: "Телефон" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "number", children: "Число" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "date", children: "Дата" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "textarea", children: "Многострочный текст" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "select", children: "Выпадающий список" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "radio", children: "Радио-кнопки" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "checkbox", children: "Чекбокс" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1", children: "Placeholder" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: editedField.placeholder || "",
              onChange: (e) => setEditedField({ ...editedField, placeholder: e.target.value }),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        (editedField.type === "select" || editedField.type === "radio") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1", children: "Опции (через запятую)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: editedField.options?.join(", ") || "",
              onChange: (e) => setEditedField({
                ...editedField,
                options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
              }),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
              placeholder: "Опция 1, Опция 2, Опция 3"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              id: `required-${editedField.id}`,
              checked: editedField.required,
              onChange: (e) => setEditedField({ ...editedField, required: e.target.checked }),
              className: "w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `required-${editedField.id}`, className: "ml-2 text-sm", children: "Обязательное поле" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleSave,
              className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
              children: "Сохранить"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleCancel,
              className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300",
              children: "Отмена"
            }
          )
        ] })
      ] })
    }
  );
}
function FormBuilder({ formId, initialFields = [], onSave }) {
  const [fields, setFields] = reactExports.useState(initialFields);
  const [isAddingField, setIsAddingField] = reactExports.useState(false);
  const [newField, setNewField] = reactExports.useState({
    type: "text",
    label: "",
    placeholder: "",
    required: false
  });
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  reactExports.useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        saveFields(newItems);
        return newItems;
      });
    }
  };
  const handleAddField = () => {
    if (!newField.label || !newField.type) {
      toast.error("Заполните обязательные поля");
      return;
    }
    const fieldId = newField.label.toLowerCase().replace(/[^a-zа-яё0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
    const field = {
      id: fieldId,
      type: newField.type,
      label: newField.label,
      placeholder: newField.placeholder,
      required: newField.required || false,
      options: newField.options
    };
    const newFields = [...fields, field];
    setFields(newFields);
    saveFields(newFields);
    setIsAddingField(false);
    setNewField({
      type: "text",
      label: "",
      placeholder: "",
      required: false
    });
    toast.success("Поле добавлено");
  };
  const handleUpdateField = (index, updatedField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
    saveFields(newFields);
  };
  const handleDeleteField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    saveFields(newFields);
    toast.success("Поле удалено");
  };
  const saveFields = async (fieldsToSave) => {
    try {
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: fieldsToSave })
      });
      const result = await response.json();
      if (result.success) {
        onSave?.(fieldsToSave);
      } else {
        toast.error("Ошибка сохранения");
      }
    } catch (error) {
      console.error("Save fields error:", error);
      toast.error("Ошибка сохранения");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Поля формы" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setIsAddingField(true),
          className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }),
            "Добавить поле"
          ]
        }
      )
    ] }),
    fields.length === 0 && !isAddingField && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 mb-4", children: "Пока нет полей в форме" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setIsAddingField(true),
          className: "text-blue-600 hover:underline",
          children: "Добавить первое поле"
        }
      )
    ] }),
    isAddingField && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-blue-900", children: "Новое поле" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1", children: "Метка поля *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: newField.label,
            onChange: (e) => setNewField({ ...newField, label: e.target.value }),
            className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
            placeholder: "Например: Ваше имя"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1", children: "Тип *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: newField.type,
            onChange: (e) => setNewField({ ...newField, type: e.target.value }),
            className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "text", children: "Текст" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "email", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "tel", children: "Телефон" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "number", children: "Число" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "date", children: "Дата" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "textarea", children: "Многострочный текст" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "select", children: "Выпадающий список" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "radio", children: "Радио-кнопки" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "checkbox", children: "Чекбокс" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1", children: "Placeholder" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: newField.placeholder,
            onChange: (e) => setNewField({ ...newField, placeholder: e.target.value }),
            className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
            placeholder: "Например: Введите ваше имя"
          }
        )
      ] }),
      (newField.type === "select" || newField.type === "radio") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1", children: "Опции (через запятую)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            onChange: (e) => setNewField({
              ...newField,
              options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            }),
            className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
            placeholder: "Опция 1, Опция 2, Опция 3"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            id: "new-field-required",
            checked: newField.required,
            onChange: (e) => setNewField({ ...newField, required: e.target.checked }),
            className: "w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "new-field-required", className: "ml-2 text-sm", children: "Обязательное поле" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleAddField,
            className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700",
            children: "Добавить"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsAddingField(false),
            className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300",
            children: "Отмена"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DndContext,
      {
        sensors,
        collisionDetection: closestCenter,
        onDragEnd: handleDragEnd,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SortableContext,
          {
            items: fields.map((f) => f.id),
            strategy: verticalListSortingStrategy,
            children: fields.map((field, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              FieldEditor,
              {
                field,
                onUpdate: (updatedField) => handleUpdateField(index, updatedField),
                onDelete: () => handleDeleteField(index)
              },
              field.id
            ))
          }
        )
      }
    )
  ] });
}

function FormPreview({
  fields,
  title = "Предпросмотр формы",
  description,
  submitText = "Отправить"
}) {
  const [formData, setFormData] = reactExports.useState({});
  const handleChange = (fieldId, value) => {
    setFormData({ ...formData, [fieldId]: value });
  };
  const renderField = (field) => {
    const commonClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
    const value = formData[field.id] || "";
    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "number":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: field.type,
            value,
            onChange: (e) => handleChange(field.id, e.target.value),
            placeholder: field.placeholder,
            required: field.required,
            className: commonClasses
          }
        );
      case "textarea":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value,
            onChange: (e) => handleChange(field.id, e.target.value),
            placeholder: field.placeholder,
            required: field.required,
            rows: 4,
            className: commonClasses
          }
        );
      case "select":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value,
            onChange: (e) => handleChange(field.id, e.target.value),
            required: field.required,
            className: commonClasses,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Выберите..." }),
              field.options?.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: option.value, children: option.label }, option.value))
            ]
          }
        );
      case "radio":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: field.options?.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: field.id,
              value: option.value,
              checked: value === option.value,
              onChange: (e) => handleChange(field.id, e.target.value),
              required: field.required,
              className: "text-blue-600"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: option.label })
        ] }, option.value)) });
      case "checkbox":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: value === true,
              onChange: (e) => handleChange(field.id, e.target.checked),
              required: field.required,
              className: "rounded text-blue-600"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: field.label })
        ] });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value,
            onChange: (e) => handleChange(field.id, e.target.value),
            placeholder: field.placeholder,
            className: commonClasses
          }
        );
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-white hover:bg-blue-600 rounded p-1", children: "←" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-white hover:bg-blue-600 rounded p-1", children: "⋮" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4 max-h-[600px] overflow-y-auto", children: [
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: description }),
      fields.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Поля формы не добавлены" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Используйте FormBuilder для добавления полей" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("form", { className: "space-y-4", onSubmit: (e) => e.preventDefault(), children: fields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        field.type !== "checkbox" && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700", children: [
          field.label,
          field.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-1", children: "*" })
        ] }),
        renderField(field),
        field.validation?.message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: field.validation.message })
      ] }, field.id)) })
    ] }),
    fields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 p-3 bg-gray-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors",
          disabled: true,
          children: submitText
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center text-gray-500 mt-2", children: "Это предпросмотр. Форма не отправляется." })
    ] })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const authResult = await requireAdminPage(Astro2);
  if (authResult.redirect) return authResult.redirect;
  const user = authResult.user;
  const formId = Astro2.params.id;
  if (!formId || formId === "new") {
    return Astro2.redirect("/admin/forms/telegram/new");
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", AdminLayout, { "title": "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0444\u043E\u0440\u043C\u044B", "user": user }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="max-w-5xl mx-auto space-y-6"> <!-- \u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F --> <div class="flex items-center gap-2 text-sm text-gray-600"> <a href="/admin/forms/telegram" class="hover:text-blue-600">\u0424\u043E\u0440\u043C\u044B</a> <span>/</span> <span class="text-gray-900">\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435</span> </div> <!-- \u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u0444\u043E\u0440\u043C\u044B --> <div class="bg-white rounded-lg border border-gray-200 p-6"> <h1 class="text-2xl font-bold mb-6">\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0444\u043E\u0440\u043C\u044B</h1> <form id="form-settings" class="space-y-4"> <div> <label class="block text-sm font-medium mb-1">\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0444\u043E\u0440\u043C\u044B *</label> <input type="text" id="form-title" name="title" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0417\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044E"> </div> <div> <label class="block text-sm font-medium mb-1">\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435</label> <textarea id="form-description" name="description" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u041A\u0440\u0430\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0444\u043E\u0440\u043C\u044B"></textarea> </div> <div> <label class="block text-sm font-medium mb-1">\u0422\u0435\u043A\u0441\u0442 \u043A\u043D\u043E\u043F\u043A\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438</label> <input type="text" id="form-submit-text" name="submit_text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C"> </div> <div> <label class="block text-sm font-medium mb-1">Telegram Chat ID</label> <input type="text" id="form-chat-id" name="chat_id" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: -1001234567890"> <p class="text-xs text-gray-500 mt-1">ID \u0447\u0430\u0442\u0430 \u0438\u043B\u0438 \u043A\u0430\u043D\u0430\u043B\u0430, \u043A\u0443\u0434\u0430 \u0431\u0443\u0434\u0443\u0442 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C\u0441\u044F \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F</p> </div> <div> <label class="block text-sm font-medium mb-1">\u0428\u0430\u0431\u043B\u043E\u043D \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F *</label> <textarea id="form-message-template" name="message_template" rows="6" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="\u{1F195} \u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u043E\u0442 {firstName}\n\n\u0418\u043C\u044F: {name}\nEmail: {email}\n\nID \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: {userId}"></textarea> <p class="text-xs text-gray-500 mt-1">\n\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043F\u043B\u0435\u0439\u0441\u0445\u043E\u043B\u0434\u0435\u0440\u044B: ', ", ", ", ", ", ", ', \u0430 \u0442\u0430\u043A\u0436\u0435 ID \u043B\u044E\u0431\u044B\u0445 \u043F\u043E\u043B\u0435\u0439 \u0444\u043E\u0440\u043C\u044B\n</p> </div> <div class="flex items-center"> <input type="checkbox" id="form-is-active" name="is_active" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"> <label for="form-is-active" class="ml-2 text-sm">\n\u0424\u043E\u0440\u043C\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0430 (\u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0435\u0442 \u0437\u0430\u044F\u0432\u043A\u0438)\n</label> </div> <div class="flex gap-3 pt-4"> <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">\n\u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438\n</button> <a', ' class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">\n\u{1F4E8} \u0417\u0430\u044F\u0432\u043A\u0438\n</a> <a href="/admin/forms/telegram" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">\n\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u0441\u043F\u0438\u0441\u043A\u0443\n</a> </div> </form> </div> <!-- \u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440 \u043F\u043E\u043B\u0435\u0439 \u0441 preview --> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6"> <!-- Form Builder --> <div class="bg-white rounded-lg border border-gray-200 p-6"> <h2 class="text-xl font-semibold mb-4">\u041F\u043E\u043B\u044F \u0444\u043E\u0440\u043C\u044B</h2> ', ' </div> <!-- Form Preview --> <div class="bg-white rounded-lg border border-gray-200 p-6"> <h2 class="text-xl font-semibold mb-4">\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440</h2> <div id="form-preview-container"> ', ' </div> </div> </div> <!-- \u041F\u0440\u0435\u0432\u044C\u044E \u0438 \u0441\u0441\u044B\u043B\u043A\u0430 --> <div class="bg-blue-50 border border-blue-200 rounded-lg p-6"> <h3 class="font-bold text-blue-900 mb-3">\u{1F517} \u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u0444\u043E\u0440\u043C\u0443</h3> <div class="bg-white rounded p-3 font-mono text-sm break-all"> <span id="form-url"></span> </div> <p class="text-sm text-blue-700 mt-2">\n\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u044D\u0442\u0443 \u0441\u0441\u044B\u043B\u043A\u0443 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u0432\u0430\u0448\u0435\u0433\u043E Telegram \u0431\u043E\u0442\u0430 (Web App URL)\n</p> </div> </div> <script>(function(){', "\n    let currentForm = null;\n\n    // \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0444\u043E\u0440\u043C\u044B\n    async function loadForm() {\n      try {\n        const response = await fetch(`/api/admin/forms/${formId}`);\n        const result = await response.json();\n        \n        if (result.success && result.data) {\n          currentForm = result.data;\n          \n          // \u0417\u0430\u043F\u043E\u043B\u043D\u044F\u0435\u043C \u043F\u043E\u043B\u044F\n          document.getElementById('form-title').value = currentForm.title || '';\n          document.getElementById('form-description').value = currentForm.description || '';\n          document.getElementById('form-submit-text').value = currentForm.submit_text || '\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C';\n          document.getElementById('form-chat-id').value = currentForm.chat_id || '';\n          document.getElementById('form-message-template').value = currentForm.message_template || '';\n          document.getElementById('form-is-active').checked = currentForm.is_active || false;\n          \n          // \u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u043C URL\n          const formUrl = `${window.location.origin}/telegram-app?form_id=${formId}`;\n          document.getElementById('form-url').textContent = formUrl;\n        } else {\n          alert('\u0424\u043E\u0440\u043C\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430');\n          window.location.href = '/admin/forms/telegram';\n        }\n      } catch (error) {\n        console.error('Load form error:', error);\n        alert('\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0444\u043E\u0440\u043C\u044B');\n      }\n    }\n\n    // \u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A\n    document.getElementById('form-settings').addEventListener('submit', async (e) => {\n      e.preventDefault();\n      \n      const formData = new FormData(e.target);\n      const data = {\n        title: formData.get('title'),\n        description: formData.get('description'),\n        submit_text: formData.get('submit_text'),\n        chat_id: formData.get('chat_id'),\n        message_template: formData.get('message_template'),\n        is_active: formData.get('is_active') === 'on',\n      };\n\n      try {\n        const response = await fetch(`/api/admin/forms/${formId}`, {\n          method: 'PUT',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify(data),\n        });\n\n        const result = await response.json();\n\n        if (result.success) {\n          alert('\u2705 \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B');\n          loadForm();\n        } else {\n          alert('\u274C \u041E\u0448\u0438\u0431\u043A\u0430: ' + (result.error?.message || 'Unknown error'));\n        }\n      } catch (error) {\n        console.error('Save error:', error);\n        alert('\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F');\n      }\n    });\n\n    // \u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0444\u043E\u0440\u043C\u0443 \u043F\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B\n    loadForm();\n  })();<\/script> "], [" ", '<div class="max-w-5xl mx-auto space-y-6"> <!-- \u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F --> <div class="flex items-center gap-2 text-sm text-gray-600"> <a href="/admin/forms/telegram" class="hover:text-blue-600">\u0424\u043E\u0440\u043C\u044B</a> <span>/</span> <span class="text-gray-900">\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435</span> </div> <!-- \u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u0444\u043E\u0440\u043C\u044B --> <div class="bg-white rounded-lg border border-gray-200 p-6"> <h1 class="text-2xl font-bold mb-6">\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0444\u043E\u0440\u043C\u044B</h1> <form id="form-settings" class="space-y-4"> <div> <label class="block text-sm font-medium mb-1">\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0444\u043E\u0440\u043C\u044B *</label> <input type="text" id="form-title" name="title" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0417\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044E"> </div> <div> <label class="block text-sm font-medium mb-1">\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435</label> <textarea id="form-description" name="description" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u041A\u0440\u0430\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0444\u043E\u0440\u043C\u044B"></textarea> </div> <div> <label class="block text-sm font-medium mb-1">\u0422\u0435\u043A\u0441\u0442 \u043A\u043D\u043E\u043F\u043A\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438</label> <input type="text" id="form-submit-text" name="submit_text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C"> </div> <div> <label class="block text-sm font-medium mb-1">Telegram Chat ID</label> <input type="text" id="form-chat-id" name="chat_id" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: -1001234567890"> <p class="text-xs text-gray-500 mt-1">ID \u0447\u0430\u0442\u0430 \u0438\u043B\u0438 \u043A\u0430\u043D\u0430\u043B\u0430, \u043A\u0443\u0434\u0430 \u0431\u0443\u0434\u0443\u0442 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C\u0441\u044F \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F</p> </div> <div> <label class="block text-sm font-medium mb-1">\u0428\u0430\u0431\u043B\u043E\u043D \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F *</label> <textarea id="form-message-template" name="message_template" rows="6" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="\u{1F195} \u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u043E\u0442 {firstName}\n\n\u0418\u043C\u044F: {name}\nEmail: {email}\n\nID \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: {userId}"></textarea> <p class="text-xs text-gray-500 mt-1">\n\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043F\u043B\u0435\u0439\u0441\u0445\u043E\u043B\u0434\u0435\u0440\u044B: ', ", ", ", ", ", ", ', \u0430 \u0442\u0430\u043A\u0436\u0435 ID \u043B\u044E\u0431\u044B\u0445 \u043F\u043E\u043B\u0435\u0439 \u0444\u043E\u0440\u043C\u044B\n</p> </div> <div class="flex items-center"> <input type="checkbox" id="form-is-active" name="is_active" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"> <label for="form-is-active" class="ml-2 text-sm">\n\u0424\u043E\u0440\u043C\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0430 (\u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0435\u0442 \u0437\u0430\u044F\u0432\u043A\u0438)\n</label> </div> <div class="flex gap-3 pt-4"> <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">\n\u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438\n</button> <a', ' class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">\n\u{1F4E8} \u0417\u0430\u044F\u0432\u043A\u0438\n</a> <a href="/admin/forms/telegram" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">\n\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u0441\u043F\u0438\u0441\u043A\u0443\n</a> </div> </form> </div> <!-- \u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440 \u043F\u043E\u043B\u0435\u0439 \u0441 preview --> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6"> <!-- Form Builder --> <div class="bg-white rounded-lg border border-gray-200 p-6"> <h2 class="text-xl font-semibold mb-4">\u041F\u043E\u043B\u044F \u0444\u043E\u0440\u043C\u044B</h2> ', ' </div> <!-- Form Preview --> <div class="bg-white rounded-lg border border-gray-200 p-6"> <h2 class="text-xl font-semibold mb-4">\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440</h2> <div id="form-preview-container"> ', ' </div> </div> </div> <!-- \u041F\u0440\u0435\u0432\u044C\u044E \u0438 \u0441\u0441\u044B\u043B\u043A\u0430 --> <div class="bg-blue-50 border border-blue-200 rounded-lg p-6"> <h3 class="font-bold text-blue-900 mb-3">\u{1F517} \u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u0444\u043E\u0440\u043C\u0443</h3> <div class="bg-white rounded p-3 font-mono text-sm break-all"> <span id="form-url"></span> </div> <p class="text-sm text-blue-700 mt-2">\n\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u044D\u0442\u0443 \u0441\u0441\u044B\u043B\u043A\u0443 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u0432\u0430\u0448\u0435\u0433\u043E Telegram \u0431\u043E\u0442\u0430 (Web App URL)\n</p> </div> </div> <script>(function(){', "\n    let currentForm = null;\n\n    // \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0444\u043E\u0440\u043C\u044B\n    async function loadForm() {\n      try {\n        const response = await fetch(\\`/api/admin/forms/\\${formId}\\`);\n        const result = await response.json();\n        \n        if (result.success && result.data) {\n          currentForm = result.data;\n          \n          // \u0417\u0430\u043F\u043E\u043B\u043D\u044F\u0435\u043C \u043F\u043E\u043B\u044F\n          document.getElementById('form-title').value = currentForm.title || '';\n          document.getElementById('form-description').value = currentForm.description || '';\n          document.getElementById('form-submit-text').value = currentForm.submit_text || '\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C';\n          document.getElementById('form-chat-id').value = currentForm.chat_id || '';\n          document.getElementById('form-message-template').value = currentForm.message_template || '';\n          document.getElementById('form-is-active').checked = currentForm.is_active || false;\n          \n          // \u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u043C URL\n          const formUrl = \\`\\${window.location.origin}/telegram-app?form_id=\\${formId}\\`;\n          document.getElementById('form-url').textContent = formUrl;\n        } else {\n          alert('\u0424\u043E\u0440\u043C\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430');\n          window.location.href = '/admin/forms/telegram';\n        }\n      } catch (error) {\n        console.error('Load form error:', error);\n        alert('\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0444\u043E\u0440\u043C\u044B');\n      }\n    }\n\n    // \u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A\n    document.getElementById('form-settings').addEventListener('submit', async (e) => {\n      e.preventDefault();\n      \n      const formData = new FormData(e.target);\n      const data = {\n        title: formData.get('title'),\n        description: formData.get('description'),\n        submit_text: formData.get('submit_text'),\n        chat_id: formData.get('chat_id'),\n        message_template: formData.get('message_template'),\n        is_active: formData.get('is_active') === 'on',\n      };\n\n      try {\n        const response = await fetch(\\`/api/admin/forms/\\${formId}\\`, {\n          method: 'PUT',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify(data),\n        });\n\n        const result = await response.json();\n\n        if (result.success) {\n          alert('\u2705 \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B');\n          loadForm();\n        } else {\n          alert('\u274C \u041E\u0448\u0438\u0431\u043A\u0430: ' + (result.error?.message || 'Unknown error'));\n        }\n      } catch (error) {\n        console.error('Save error:', error);\n        alert('\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F');\n      }\n    });\n\n    // \u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0444\u043E\u0440\u043C\u0443 \u043F\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B\n    loadForm();\n  })();<\/script> "])), maybeRenderHead(), firstName, lastName, username, userId, addAttribute(`/admin/forms/telegram/${formId}/submissions`, "href"), renderComponent($$result2, "ErrorBoundary", ErrorBoundary, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/ErrorBoundary.tsx", "client:component-export": "default" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "FormBuilder", FormBuilder, { "formId": formId, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/FormBuilder.tsx", "client:component-export": "default" })} ` }), renderComponent($$result2, "ErrorBoundary", ErrorBoundary, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/ErrorBoundary.tsx", "client:component-export": "default" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "FormPreview", FormPreview, { "fields": [], "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/FormPreview.tsx", "client:component-export": "default" })} ` }), defineScriptVars({ formId })) })}`;
}, "C:/Users/User/Desktop/sri/src/pages/admin/forms/telegram/[id].astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/forms/telegram/[id].astro";
const $$url = "/admin/forms/telegram/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
