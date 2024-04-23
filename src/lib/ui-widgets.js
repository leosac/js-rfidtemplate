const keys = [];

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
            return (
                <input
                    id={props.id}
                    type='text'
                    className='form-control'
                    name={props.name}
                    value={props.value}
                    placeholder={props.placeholder}
                    required={props.required}
                    onChange={(event) => props.onChange(event.target.value)} />
            );
        }
    }
};

export { keys, uiWidgets };