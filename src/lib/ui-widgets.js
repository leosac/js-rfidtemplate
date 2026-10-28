import React, { useEffect, useRef, useState } from 'react';
import FormCheck from 'react-bootstrap/FormCheck';
import Dropdown from 'react-bootstrap/Dropdown';

const keys = [];

function KeySelectWidget(props) {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const searchInput = useRef(null);
    const optionList = useRef(null);
    const disabled = props.disabled || props.readonly;
    useEffect(() => {
        if (open && !disabled) {
            searchInput.current.focus();
        }
    }, [open, disabled]);
    const query = search.trim().toLowerCase();
    const options = keys.map(key => ({ value: key.id, label: key.name }));
    if (props.value && !keys.some(key => key.id === props.value)) {
        options.push({ value: props.value, label: `Unknown Key \`${props.value}\`` });
    }
    const matches = option => option.label.toLowerCase().includes(query)
        || String(option.value).toLowerCase().includes(query);
    const filteredOptions = options.filter(matches);
    const selectedOption = options.find(option => option.value === props.value);
    const toggle = nextOpen => {
        setOpen(nextOpen);
        setSearch('');
    };
    const select = value => {
        props.onChange(value);
        toggle(false);
    };

    return (
        <Dropdown
            className="encoding-template-key-select"
            show={open && !disabled}
            onToggle={toggle}
            onSelect={select}
            focusFirstItemOnShow={false}
            onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    toggle(false);
                }
            }}>
            <input type="hidden" name={props.name} value={props.value == null ? '' : props.value} disabled={disabled} />
            <Dropdown.Toggle
                id={props.id}
                variant=""
                className="form-control custom-select text-left"
                aria-label={(props.label || 'Key') + ': ' + (selectedOption ? selectedOption.label : 'Select a key')}
                aria-haspopup="dialog"
                aria-controls={props.id + '_menu'}
                disabled={disabled}>
                {selectedOption ? selectedOption.label : '\u00a0'}
            </Dropdown.Toggle>
            {open && !disabled && (
                <Dropdown.Menu
                    id={props.id + '_menu'}
                    className="w-100"
                    role="dialog"
                    aria-label={(props.label || 'Key') + ' selection'}>
                    <div className="px-2 pb-2">
                        <input
                            ref={searchInput}
                            id={props.id + '_search'}
                            type="search"
                            className="form-control"
                            aria-label={'Search ' + (props.label || 'keys')}
                            aria-controls={props.id + '_options'}
                            placeholder="Search keys by name or ID"
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            onKeyDown={event => {
                                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    const items = optionList.current.querySelectorAll('[role="option"]');
                                    const item = event.key === 'ArrowDown' ? items[0] : items[items.length - 1];
                                    if (item) item.focus();
                                } else if (event.key === 'Enter') {
                                    event.preventDefault();
                                    if (filteredOptions.length > 0) select(filteredOptions[0].value);
                                }
                            }} />
                    </div>
                    <div
                        ref={optionList}
                        id={props.id + '_options'}
                        className="encoding-template-key-options"
                        role="listbox"
                        aria-label={props.label || 'Keys'}
                        aria-required={props.required}>
                        {props.schema.nullable && (
                            <Dropdown.Item as="button" type="button" eventKey="" role="option" aria-selected={!props.value}>
                                No key
                            </Dropdown.Item>
                        )}
                        {filteredOptions.map(option => (
                            <Dropdown.Item
                                as="button"
                                type="button"
                                key={option.value}
                                eventKey={option.value}
                                role="option"
                                active={option.value === props.value}
                                aria-selected={option.value === props.value}>
                                {option.label}
                            </Dropdown.Item>
                        ))}
                    </div>
                    {filteredOptions.length === 0 && (
                        <small className="text-muted d-block px-3 py-2" role="status">No matching keys</small>
                    )}
                </Dropdown.Menu>
            )}
        </Dropdown>
    );
}

function getHex(number, padding = undefined) {
    let hex = undefined;
    if (number !== undefined) {
        hex = Number(number).toString(16);
        if (padding !== undefined) {
            hex = hex.padStart(padding, '0');
        }
    }
    return hex;
}

const uiWidgets = {
    CheckboxWidget: function(props) {
        return (
            <>
                <FormCheck
                type="switch"
                id={props.id}
                name={props.name}
                disabled={props.disabled}
                label={props.label}
                checked={props.value}
                onChange={(event) => props.onChange(event.target.checked)} />
                <small className="text-muted form-text">
                    {props.schema.description}
                </small>
            </>
        );
    },
    TextWidget: function(props) {
        if (props.schema['x-key']) {
            return <KeySelectWidget {...props} />;
        } else {
            if (props.schema.type === 'number' || props.schema.type === 'integer') {
                if (props.schema['x-hexinput']) {
                    return (
                        <div className="row">
                            <div className="col-6">
                                <input
                                    id={props.id}
                                    type='number'
                                    className='form-control'
                                    name={props.name}
                                    value={props.value}
                                    placeholder={props.placeholder}
                                    min={props.schema.minimum}
                                    max={props.schema.maximum}
                                    readOnly={props.readonly}
                                    disabled={props.disabled}
                                    onChange={(event) => props.onChange(event.target.value)} />
                            </div>
                            <div className="col-6">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text">0x</div>
                                    </div>
                                    <input
                                        id={props.id + "_hex"}
                                        type='text'
                                        className='form-control'
                                        value={getHex(props.value, props.schema['x-hexlength'])}
                                        placeholder={props.placeholder}
                                        required={props.required}
                                        minLength={props.schema['x-hexlength']}
                                        pattern="^[a-fA-F0-9]+$"
                                        readOnly={props.readonly}
                                        disabled={props.disabled}
                                        onChange={(event) => {
                                            const selectionStart = event.target.selectionStart;
                                            if (props.schema['x-hexlength'] && event.target.value.length > props.schema['x-hexlength']) {
                                                if (event.target.value[0] === '0') {
                                                    event.target.value = event.target.value.substring(1);
                                                } else {
                                                    event.target.value = event.target.value.substring(0, props.schema['x-hexlength']);
                                                }
                                            }
                                            const v = parseInt(event.target.value, 16);
                                            document.getElementById(props.id).value = v;
                                            props.onChange(v);
                                            if (props.schema['x-hexlength'] && selectionStart < props.schema['x-hexlength']) {
                                                event.target.setSelectionRange(selectionStart, selectionStart + 1);
                                            }
                                        }} />
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className="row">
                            <input
                                id={props.id}
                                type='number'
                                className='form-control'
                                name={props.name}
                                value={props.value}
                                placeholder={props.placeholder}
                                required={props.required}
                                min={props.schema.minimum}
                                max={props.schema.maximum}
                                readOnly={props.readonly}
                                disabled={props.disabled}
                                list={(props.schema.examples || props.schema['x-examples']) ? props.id + '_list' : undefined}
                                onChange={(event) => props.onChange(event.target.value)} />
                                {props.schema.examples && (
                                    <datalist id={props.id + '_list'}>
                                        {Array.isArray(props.schema.examples) && props.schema.examples.map((example) => {
                                            return <option key={example} value={example} />;
                                        })}
                                    </datalist>
                                )}
                                {props.schema['x-examples'] && (
                                    <datalist id={props.id + '_list'}>
                                        {Object.keys(props.schema['x-examples']).map((key) => {
                                            return <option key={props.schema['x-examples'][key]} value={props.schema['x-examples'][key]} label={key} />;
                                        })}
                                    </datalist>
                                )}
                        </div>
                    );
                }
            } else {
                return (
                    <div className="row">
                        <input
                            id={props.id}
                            type='text'
                            className='form-control'
                            name={props.name}
                            value={props.value}
                            placeholder={props.placeholder}
                            required={props.required}
                            minLength={props.schema.minLength}
                            maxLength={props.schema.maxLength}
                            pattern={props.schema.pattern}
                            readOnly={props.readonly}
                            disabled={props.disabled}
                            list={(props.schema.examples || props.schema['x-examples']) ? props.id + '_list' : undefined}
                            onChange={(event) => props.onChange(event.target.value)} />
                        {props.schema.examples && (
                            <datalist id={props.id + '_list'}>
                                {Array.isArray(props.schema.examples) && props.schema.examples.map((example) => {
                                    return <option key={example} value={example} />;
                                })}
                            </datalist>
                        )}
                        {props.schema['x-examples'] && (
                            <datalist id={props.id + '_list'}>
                                {Object.keys(props.schema['x-examples']).map((key) => {
                                    return <option key={props.schema['x-examples'][key]} value={props.schema['x-examples'][key]} label={key} />;
                                })}
                            </datalist>
                        )}
                    </div>
                );
            }
        }
    }
};

export { keys, uiWidgets };