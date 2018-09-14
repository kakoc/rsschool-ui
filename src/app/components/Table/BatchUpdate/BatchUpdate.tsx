import * as React from 'react';
import ReactTable from 'react-table';
import { Dropdown } from 'components/Dropdown';

export const BatchUpdateTable = (columns: any) => ({ rows: { dropdown, ...rows }, handleClick }: any) => {
    return (
        <ReactTable
            className="-highlight"
            style={{ cursor: 'pointer', alignItems: 'center' }}
            columns={columns}
            data={Object.keys(rows).map((row: string, i: number) => {
                return {
                    nRow: i + 1,
                    header: rows[row].tableColumn,
                    checkbox: (
                        <input
                            type="checkbox"
                            id={rows[row].tableColumn}
                            checked={rows[row].isIgnored}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleClick(row, 'isIgnored', !rows[row].isIgnored)}
                        />
                    ),
                    dropdown: (
                        <Dropdown
                            defaultValue="Select field"
                            onSelect={(field: any) => handleClick(row, 'assignmentsField', field.value)}
                            menuItems={dropdown.map((field: string) => ({
                                id: field,
                                value: field,
                            }))}
                        />
                    ),
                };
            })}
            showPagination={false}
            defaultPageSize={Object.keys(rows).length}
            getTdProps={(_: any, rowInfo: any, cell: any) => {
                return {
                    onClick: () => {
                        const { Header } = cell;
                        if (!(Header === 'Select field')) {
                            const row = rowInfo.original;
                            handleClick(row.nRow - 1, 'isIgnored', !row.checkbox.props.checked);
                        }
                    },
                };
            }}
        />
    );
};
