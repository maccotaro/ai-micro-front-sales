import React from 'react';
import { GitBranch } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ChatPipelineSelectorProps {
  selectedPipeline?: 'v1' | 'v2';
  onPipelineChange: (pipeline: 'v1' | 'v2') => void;
  disabled?: boolean;
}

export function ChatPipelineSelector({
  selectedPipeline,
  onPipelineChange,
  disabled = false,
}: ChatPipelineSelectorProps) {
  const currentValue = selectedPipeline || 'v1';

  return (
    <div className="flex items-center gap-1.5">
      <GitBranch className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <Select
        value={currentValue}
        onValueChange={(value) => onPipelineChange(value as 'v1' | 'v2')}
        disabled={disabled}
      >
        <SelectTrigger className="h-7 w-auto min-w-[70px] text-xs border-dashed">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="v1">
            <span className="text-xs">v1</span>
          </SelectItem>
          <SelectItem value="v2">
            <span className="text-xs">v2</span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
