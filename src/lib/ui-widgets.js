const keys = [];

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
    TextWidget: function(props) {
        if (props.schema['x-key']) {
            return (
                <select
                    id={props.id}
                    className='form-control'
                    name={props.name}>
                        {props.schema.nullable && (
                            <option></option>
                        )}
                        {keys.map((key) => (
                            <option value={key.id} selected={(key.id === props.value)}>{key.name}</option>
                        ))}
                        {props.value && !keys.some(key => key.id === props.value) && (
                            <option value={props.value} selected='true'>Unknown Key `{props.value}`</option>
                        )}
                </select>
            );
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
                            onChange={(event) => props.onChange(event.target.value)} />
                    );
                }
            } else {
                return (
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
                        onChange={(event) => props.onChange(event.target.value)} />
                );
            }
        }
    }
};

export { keys, uiWidgets };