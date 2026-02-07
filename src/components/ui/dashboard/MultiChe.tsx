import { Select, Tag } from 'antd';

const tagRender = (props) => {
    const { label, closable, onClose } = props;

    const onPreventMouseDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose}>
            {label}
        </Tag>
    );
};

export default function MultiSelectCheckbox({ references, value = [], onChange }) {
    const options = references.docStateList.map((item) => ({
        label: item.label,
        value: item.id,
    }));
    return (
        <Select
            mode="multiple"
            tagRender={tagRender}
            value={value} // текущее значение
            onChange={onChange} // передаём наверх
            style={{ width: '100%', minWidth: 145 }}
            options={options}
        />
    );
}
