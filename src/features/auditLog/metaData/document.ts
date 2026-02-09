//(метаданные) JSON-объект, который описывает форму с различными полями и секциями
export const documentFormData = {
    formName: 'documentFormData',
    label: 'Документы',
    sections: [
        {
            id: 'a6b64b38-3784-4f63-887f-602c731a4f99',
            contents: [
                {
                    type: 'Text',
                    name: 'name',
                    label: 'Наименование',
                },
                {
                    type: 'Text',
                    name: 'price',
                    label: 'Стоимость',
                },
                {
                    type: 'Text',
                    name: 'description',
                    label: 'Описание',
                },
                {
                    type: 'Text',
                    name: 'responsible_users',
                    label: 'Исполнители',
                },
            ],
        },
    ],
};
