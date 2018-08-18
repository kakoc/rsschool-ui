import * as React from 'react';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import { classNames } from 'core/styles';

const cn = classNames(require('./index.scss'));

class Dropdown extends React.Component<any, any> {
    static getDerivedStateFromProps(props: any, state: any) {
        if (props.defaultValue !== state.defaultValue) {
            return { ...state, defaultValue: props.defaultValue };
        } else {
            return null;
        }
    }

    state = {
        toggle: false,
        isOpen: false,
        defaultValue: 'Select item',
        currentValue: '',
    };

    select = (item: any) => {
        this.setState({ currentValue: item.value });
        this.props.onSelect(item);
    };

    render() {
        return (
            <ButtonDropdown
                isOpen={this.state.isOpen}
                toggle={() => this.setState((prevState: any) => ({ isOpen: !prevState.isOpen }))}
                className={cn('control-buttons')}
            >
                <DropdownToggle className={cn('action-button')} color="primary" caret={true}>
                    {this.state.currentValue ? this.state.currentValue : this.state.defaultValue}
                </DropdownToggle>
                <DropdownMenu>
                    {this.props.menuItems.map((item: any) => {
                        return (
                            <DropdownItem
                                className={cn('action-button')}
                                key={item.id}
                                onClick={() => this.select(item)}
                            >
                                {item.value}
                            </DropdownItem>
                        );
                    })}
                </DropdownMenu>
            </ButtonDropdown>
        );
    }
}

export default Dropdown;
