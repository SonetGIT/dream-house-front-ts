import { TablePagination } from '@/components/ui/TablePagination';
import type { Pagination } from '@/features/users/userSlice';
import type { MaterialMovement } from './materialMovementsSlice';

interface PropsType {
    data: MaterialMovement[];
    pagination: Pagination | null | undefined;
    getRefName: {
        materialName: (id: number) => string;
        wareHouseName: (id: number) => string;
        userName: (id: number) => string;
        movementsName: (id: number) => string;
    };
}

/*******************************************************************************************************************************/
export default function MaterialMovementsTable(props: PropsType) {
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        {/* <th>Наименование склада</th> */}
                        <th>Дата</th>
                        <th>Со склада</th>
                        <th>На склад</th>
                        <th>Выполнил</th>
                        <th>Автоматическая транзакция</th>
                        <th>Материал</th>
                        <th>Кол-во</th>
                        <th>Операция</th>
                        <th>Cтатус</th>
                    </tr>
                </thead>

                <tbody>
                    {props.data?.length > 0 ? (
                        props.data.map((item) => (
                            <tr key={item.id}>
                                <td>{new Date(item.date).toLocaleDateString('ru-RU')}</td>
                                <td>
                                    {item.from_warehouse_id !== null
                                        ? props.getRefName.wareHouseName(item.from_warehouse_id)
                                        : '-'}
                                </td>
                                <td>
                                    {item.to_warehouse_id !== null
                                        ? props.getRefName.wareHouseName(item.to_warehouse_id)
                                        : '-'}
                                </td>
                                <td>{props.getRefName.userName(item.user_id)}</td>
                                <td>{item.note}</td>
                                <td>{props.getRefName.materialName(item.material_id)}</td>

                                <td>{item.quantity}</td>
                                <td>{item.operation}</td>
                                <td>{props.getRefName.movementsName(item.status)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: 'red' }}>
                                Ничего не найдено
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/*Пагинация***************************************************************************************************************/}
            <TablePagination pagination={props.pagination} />
        </div>
    );
}
