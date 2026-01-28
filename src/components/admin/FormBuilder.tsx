/**
 * FormBuilder - конструктор форм с drag-n-drop
 * Позволяет создавать и редактировать поля формы
 */

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import type { FormField, FormFieldType } from '../../types/telegram.types';

interface FormBuilderProps {
  formId: string;
  initialFields?: FormField[];
  onSave?: (fields: FormField[]) => void;
}

// Компонент для редактирования поля
function FieldEditor({
  field,
  onUpdate,
  onDelete,
}: {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedField, setEditedField] = useState(field);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(editedField);
    setIsEditing(false);
    toast.success('Поле обновлено');
  };

  const handleCancel = () => {
    setEditedField(field);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm"
    >
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{field.label}</span>
                {field.required && (
                  <span className="text-red-500 text-xs">* обязательно</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Тип: <span className="font-mono">{field.type}</span>
                {field.placeholder && ` • Placeholder: "${field.placeholder}"`}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Изменить
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Удалить
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Метка поля *</label>
            <input
              type="text"
              value={editedField.label}
              onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ID поля *</label>
            <input
              type="text"
              value={editedField.id}
              onChange={(e) => setEditedField({ ...editedField, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Тип *</label>
            <select
              value={editedField.type}
              onChange={(e) => setEditedField({ ...editedField, type: e.target.value as FormFieldType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Текст</option>
              <option value="email">Email</option>
              <option value="tel">Телефон</option>
              <option value="number">Число</option>
              <option value="date">Дата</option>
              <option value="textarea">Многострочный текст</option>
              <option value="select">Выпадающий список</option>
              <option value="radio">Радио-кнопки</option>
              <option value="checkbox">Чекбокс</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Placeholder</label>
            <input
              type="text"
              value={editedField.placeholder || ''}
              onChange={(e) => setEditedField({ ...editedField, placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(editedField.type === 'select' || editedField.type === 'radio') && (
            <div>
              <label className="block text-sm font-medium mb-1">Опции (через запятую)</label>
              <input
                type="text"
                value={editedField.options?.join(', ') || ''}
                onChange={(e) => setEditedField({
                  ...editedField,
                  options: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Опция 1, Опция 2, Опция 3"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id={`required-${editedField.id}`}
              checked={editedField.required}
              onChange={(e) => setEditedField({ ...editedField, required: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor={`required-${editedField.id}`} className="ml-2 text-sm">
              Обязательное поле
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Сохранить
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormBuilder({ formId, initialFields = [], onSave }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<Partial<FormField>>({
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Автосохранение при изменении порядка
        saveFields(newItems);
        
        return newItems;
      });
    }
  };

  const handleAddField = () => {
    if (!newField.label || !newField.type) {
      toast.error('Заполните обязательные поля');
      return;
    }

    const fieldId = newField.label
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const field: FormField = {
      id: fieldId,
      type: newField.type as FormFieldType,
      label: newField.label,
      placeholder: newField.placeholder,
      required: newField.required || false,
      options: newField.options,
    };

    const newFields = [...fields, field];
    setFields(newFields);
    saveFields(newFields);
    
    setIsAddingField(false);
    setNewField({
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
    });
    
    toast.success('Поле добавлено');
  };

  const handleUpdateField = (index: number, updatedField: FormField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
    saveFields(newFields);
  };

  const handleDeleteField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    saveFields(newFields);
    toast.success('Поле удалено');
  };

  const saveFields = async (fieldsToSave: FormField[]) => {
    try {
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToSave }),
      });

      const result = await response.json();
      
      if (result.success) {
        onSave?.(fieldsToSave);
      } else {
        toast.error('Ошибка сохранения');
      }
    } catch (error) {
      console.error('Save fields error:', error);
      toast.error('Ошибка сохранения');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Поля формы</h2>
        <button
          onClick={() => setIsAddingField(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить поле
        </button>
      </div>

      {fields.length === 0 && !isAddingField && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Пока нет полей в форме</p>
          <button
            onClick={() => setIsAddingField(true)}
            className="text-blue-600 hover:underline"
          >
            Добавить первое поле
          </button>
        </div>
      )}

      {isAddingField && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-blue-900">Новое поле</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Метка поля *</label>
            <input
              type="text"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: Ваше имя"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Тип *</label>
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value as FormFieldType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Текст</option>
              <option value="email">Email</option>
              <option value="tel">Телефон</option>
              <option value="number">Число</option>
              <option value="date">Дата</option>
              <option value="textarea">Многострочный текст</option>
              <option value="select">Выпадающий список</option>
              <option value="radio">Радио-кнопки</option>
              <option value="checkbox">Чекбокс</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Placeholder</label>
            <input
              type="text"
              value={newField.placeholder}
              onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: Введите ваше имя"
            />
          </div>

          {(newField.type === 'select' || newField.type === 'radio') && (
            <div>
              <label className="block text-sm font-medium mb-1">Опции (через запятую)</label>
              <input
                type="text"
                onChange={(e) => setNewField({
                  ...newField,
                  options: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Опция 1, Опция 2, Опция 3"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="new-field-required"
              checked={newField.required}
              onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="new-field-required" className="ml-2 text-sm">
              Обязательное поле
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAddField}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Добавить
            </button>
            <button
              onClick={() => setIsAddingField(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map(f => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, index) => (
            <FieldEditor
              key={field.id}
              field={field}
              onUpdate={(updatedField) => handleUpdateField(index, updatedField)}
              onDelete={() => handleDeleteField(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
