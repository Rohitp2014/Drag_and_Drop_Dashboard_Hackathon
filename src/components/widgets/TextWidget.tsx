import React, { useState } from 'react';
import { Widget } from '../../types';
import { Edit } from 'lucide-react';

interface TextWidgetProps {
  widget: Widget;
}

export const TextWidget: React.FC<TextWidgetProps> = ({ widget }) => {
  const { data } = widget;
  const { content = 'Enter your text here...' } = data;
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="h-full">
      {isEditing ? (
        <textarea
          defaultValue={content}
          className="w-full h-full resize-none border-none outline-none text-gray-800 placeholder-gray-400"
          placeholder="Enter your text here..."
          onBlur={() => setIsEditing(false)}
          autoFocus
        />
      ) : (
        <div 
          className="h-full cursor-text relative group"
          onClick={() => setIsEditing(true)}
        >
          <div className="text-gray-800 whitespace-pre-wrap">{content}</div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
};