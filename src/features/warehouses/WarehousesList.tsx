import { RiArrowRightUpBoxFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { Warehouse } from './warehousesSlice';

interface PropsType {
    items: Warehouse[];
    pagination: { total: number } | undefined;
    getRefName: {
        [key: string]: (id: number | string) => string;
    };
}

/*******************************************************************************************************************************/
export default function WarehousesList(props: PropsType) {
    const navigate = useNavigate();
    const handleRowClick = (warehouse: Warehouse) => {
        navigate(`${warehouse.id}`, { state: { warehouse } });
        console.log('warehouse', warehouse);
    };

    /*******************************************************************************************************************************/
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Наименование склада</th>
                        <th>Код</th>
                        <th>Адрес</th>
                        <th>Кладовшик</th>
                        <th>Телефон</th>
                        <th>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {props.items?.length > 0 ? (
                        props.items.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => handleRowClick(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{item.name}</td>
                                <td>{item.code}</td>
                                <td>{item.address}</td>
                                <td>{props.getRefName.userName(item.manager_id)}</td>
                                <td>{item.phone}</td>
                                <td className="action-container">
                                    <StyledTooltip title="Открыть">
                                        <RiArrowRightUpBoxFill
                                            size={15}
                                            color="#66a7da"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRowClick(item);
                                            }}
                                        />
                                    </StyledTooltip>
                                </td>
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
            <div className="table-footer-container">
                <div className="pagination">
                    <span className="page-count">Кол-во: {props.pagination?.total}</span>
                </div>
            </div>
        </div>
    );
}
