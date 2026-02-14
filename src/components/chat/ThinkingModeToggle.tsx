import React from 'react';
import { Brain } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ThinkingModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  supportsThinking: boolean;
  disabled?: boolean;
}

export function ThinkingModeToggle({
  enabled,
  onToggle,
  supportsThinking,
  disabled = false,
}: ThinkingModeToggleProps) {
  const isDisabled = disabled || !supportsThinking;
  const isOn = enabled && supportsThinking;

  const tooltipText = !supportsThinking
    ? 'このモデルは思考モードに対応していません'
    : isOn
    ? '思考モード：複雑な推論で精度向上（応答が遅くなります）'
    : '思考モードをONにすると複雑な推論で精度が向上します';

  const handleClick = () => {
    if (!isDisabled) {
      onToggle(!isOn);
    }
  };

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className={`
              flex items-center gap-1.5 h-7 px-2 rounded-md text-xs border border-dashed
              transition-colors duration-150
              ${isOn
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : 'text-gray-500 border-gray-300'
              }
              ${isDisabled
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-gray-50 cursor-pointer'
              }
            `}
          >
            <Brain className={`h-3.5 w-3.5 flex-shrink-0 ${isOn ? 'text-purple-600' : ''}`} />
            <span className="whitespace-nowrap">{isOn ? '思考ON' : '思考OFF'}</span>
            <span
              className={`
                relative inline-flex h-4 w-7 items-center rounded-full transition-colors
                ${isOn ? 'bg-purple-500' : 'bg-gray-300'}
                ${isDisabled ? 'bg-gray-200' : ''}
              `}
            >
              <span
                className={`
                  inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform
                  ${isOn ? 'translate-x-3.5' : 'translate-x-0.5'}
                `}
              />
            </span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 max-w-xs rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-md"
            sideOffset={5}
          >
            {tooltipText}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
