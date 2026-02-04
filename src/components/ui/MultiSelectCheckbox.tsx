import { Select, Tag } from 'antd';
import React from 'react';

interface TagRenderProps {
    label?: React.ReactNode;
    value?: number;
    closable?: boolean;
    onClose?: () => void;
}

interface DocStateItem {
    id: number;
    label: string;
}

interface References {
    docStateList: DocStateItem[];
}

interface MultiSelectCheckboxProps {
    references: References;
    value?: number[];
    onChange?: (value: number[]) => void;
}

const tagRender = (props: TagRenderProps) => {
    const { label, closable, onClose } = props;

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose}>
            {label}
        </Tag>
    );
};

export default function MultiSelectCheckbox({
    references,
    value = [],
    onChange,
}: MultiSelectCheckboxProps) {
    const options = references.docStateList.map((item) => ({
        label: item.label,
        value: item.id,
    }));

    return (
        <Select<number[]>
            mode="multiple"
            tagRender={tagRender}
            value={value}
            onChange={onChange}
            style={{ width: '100%', minWidth: 145 }}
            options={options}
        />
    );
}
