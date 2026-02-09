import React from 'react';
import { Bot } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OllamaModel } from '@/types';

interface ChatModelSelectorProps {
  selectedModel?: string;
  defaultModel: string;
  availableModels: OllamaModel[];
  onModelChange: (model?: string) => void;
  disabled?: boolean;
}

const DEFAULT_VALUE = '__default__';

export function ChatModelSelector({
  selectedModel,
  defaultModel,
  availableModels,
  onModelChange,
  disabled = false,
}: ChatModelSelectorProps) {
  const handleValueChange = (value: string) => {
    if (value === DEFAULT_VALUE) {
      onModelChange(undefined);
    } else {
      onModelChange(value);
    }
  };

  const displayModelName = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 18) + '...';
    }
    return name;
  };

  return (
    <div className="flex items-center gap-1.5">
      <Bot className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <Select
        value={selectedModel || DEFAULT_VALUE}
        onValueChange={handleValueChange}
        disabled={disabled || availableModels.length === 0}
      >
        <SelectTrigger className="h-7 w-auto min-w-[140px] max-w-[220px] text-xs border-dashed">
          <SelectValue placeholder="モデル選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DEFAULT_VALUE}>
            <span className="text-xs">
              デフォルト ({displayModelName(defaultModel)})
            </span>
          </SelectItem>
          <SelectSeparator />
          {availableModels.map((model) => (
            <SelectItem key={model.name} value={model.name}>
              <span className="text-xs flex items-center gap-2">
                <span>{model.name}</span>
                <span className="text-muted-foreground">{model.size_display}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
