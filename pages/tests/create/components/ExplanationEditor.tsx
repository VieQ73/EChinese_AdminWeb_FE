import React from 'react';
import { Button } from '../../../../components/ui/Button';
import { PlusIcon, TrashIcon } from 'lucide-react';
import CollapsibleContainer from './shared/CollapsibleContainer';
import RichTextEditor from '../../../../components/RichTextEditor';

interface ExplanationEditorProps {
  explanation: string | undefined;
  onExplanationChange: (explanation: string | undefined) => void;
}

/**
 * Component ExplanationEditor
 * Cung cấp giao diện để thêm, sửa, xóa giải thích cho một câu hỏi.
 * - Nếu chưa có giải thích, hiển thị nút "Thêm giải thích".
 * - Khi đã có, hiển thị RichTextEditor trong một CollapsibleContainer.
 */
const ExplanationEditor: React.FC<ExplanationEditorProps> = ({ explanation, onExplanationChange }) => {
  // Trường hợp chưa có giải thích (explanation là undefined)
  if (typeof explanation === 'undefined') {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => onExplanationChange('')} // Thêm mới một giải thích rỗng để bắt đầu chỉnh sửa
      >
        <PlusIcon className="w-4 h-4 mr-1" />
        Thêm giải thích
      </Button>
    );
  }

  // Trường hợp đã có giải thích (là một chuỗi, kể cả rỗng)
  return (
    <CollapsibleContainer
      title="Giải thích chi tiết"
      defaultOpen={true} // Mặc định mở khi đã có
      actions={
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => onExplanationChange(undefined)} // Xóa giải thích bằng cách đặt về undefined
        >
          <TrashIcon className="w-4 h-4 mr-1" /> Xóa giải thích
        </Button>
      }
    >
      <RichTextEditor
        initialContent={explanation}
        onChange={onExplanationChange}
        placeholder="Nhập giải thích chi tiết cho câu hỏi..."
      />
    </CollapsibleContainer>
  );
};

export default ExplanationEditor;
