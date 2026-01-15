import type { WarehouseStocks } from './warehouseStocksSlice';
import { TablePagination } from '@/components/ui/TablePagination';
import type { Pagination } from '@/features/users/userSlice';

interface PropsType {
    data: WarehouseStocks[];
    pagination: Pagination | null | undefined;
    getRefName: {
        [key: string]: (id: number | string) => string;
    };
}

/*******************************************************************************************************************************/
export default function WarehouseStocksTable(props: PropsType) {
    /*******************************************************************************************************************************/
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Наименование склада</th>
                        <th>Тип материала</th>
                        <th>Материал</th>
                        <th>Едю изм.</th>
                        <th>Количество</th>
                    </tr>
                </thead>

                <tbody>
                    {props.data?.length > 0 ? (
                        props.data.map((item) => (
                            <tr key={item.id}>
                                <td>{props.getRefName.houseName(item.warehouse_id)}</td>
                                <td>{props.getRefName.materialTypeName(item.material_type)}</td>
                                <td>{props.getRefName.materialName(item.material_id)}</td>
                                <td>{props.getRefName.unitName(item.unit_of_measure)}</td>
                                <td>{item.quantity}</td>
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
