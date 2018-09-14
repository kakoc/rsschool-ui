import { BatchUpdateTable } from './BatchUpdate';

const columns = () => {
    const sizes = [50, 400, 200, 300];
    const cellStyle = { textAlign: 'center', alignSelf: 'center' };

    return [
        {
            Header: '№',
            accessor: 'nRow',
            maxWidth: sizes[0],
            style: cellStyle,
        },
        { Header: 'Task columns', accessor: 'header', width: sizes[1], style: { alignSelf: cellStyle.alignSelf } },
        {
            Header: 'No import columns',
            accessor: 'checkbox',
            minWidth: sizes[2],
            style: cellStyle,
        },
        { Header: 'Select field', accessor: 'dropdown', style: cellStyle, minWidth: sizes[3] },
    ];
};

export default BatchUpdateTable(columns());
