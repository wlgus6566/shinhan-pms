'use client';

import { useWorkLogSuggestions } from '@/lib/api/workLogs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Clock } from 'lucide-react';
import { useState } from 'react';
import type { WorkLogContentSuggestion } from '@repo/schema';

interface WorkLogSuggestionsProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (content: string) => void;
  anchorRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function WorkLogSuggestions({
  taskId,
  open,
  onOpenChange,
  onSelect,
  anchorRef,
}: WorkLogSuggestionsProps) {
  const { suggestions, isLoading } = useWorkLogSuggestions(taskId, 10);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter suggestions based on search query
  const filteredSuggestions = suggestions.filter(
    (s: WorkLogContentSuggestion) =>
      s.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div ref={anchorRef as any} />
      </PopoverTrigger>
      <PopoverContent
        className="w-[500px] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                추천 내용을 불러오는 중...
              </div>
            ) : filteredSuggestions.length === 0 ? (
              <CommandEmpty>
                {searchQuery
                  ? '검색 결과가 없습니다'
                  : '과거 작업 내용이 없습니다'}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredSuggestions.map(
                  (suggestion: WorkLogContentSuggestion, index: number) => (
                    <CommandItem
                      key={index}
                      value={suggestion.content}
                      onSelect={() => {
                        onSelect(suggestion.content);
                        onOpenChange(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-row justify-between gap-1 w-full">
                        <div className="line-clamp-2 text-sm flex-1">
                          {suggestion.content}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground w-[14%]">
                          <div className="flex items-center gap-1">
                            <Clock className="h-2 w-2" />
                            <span>{formatDate(suggestion.lastUsedDate)}</span>
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
